import { RSAA } from "redux-api-middleware";
import uuid from "lodash-uuid";
import _ from "lodash";
import {
  formatQuery,
  formatPageQuery,
  formatPageQueryWithCount,
  formatGQLString,
  formatMutation,
  formatServerError,
  decodeId,
} from "./helpers/api";
import * as Sentry from "@sentry/react";
import { getLocalStorage, setLocalStorage } from "./helpers/useLocalStorage";
import { isSessionError, clearExpiredSession, hasStoredAuthSession, isImpersonationError } from "./helpers/api";
import { isUnauthenticatedRoute, redirectToLogin } from "./helpers/utils";

const REQUESTED_WITH = "webapp";

const ROLE_FULL_PROJECTION = () => [
  "id",
  "uuid",
  "name",
  "altLanguage",
  "isSystem",
  "isBlocked",
  "validityFrom",
  "validityTo",
];

const ROLERIGHT_FULL_PROJECTION = () => ["rightId"];

const LANGUAGE_FULL_PROJECTION = () => ["name", "code"];

const MODULEPERMISSION_FULL_PROJECTION = () => ["modulePermsList{moduleName, permissions{permsName, permsValue}}"];

const CUSTOM_FILTER_FULL_PROJECTION = () => ["type", "code", "possibleFilters {field, filter, type}"];

export function fetchCustomFilter(params) {
  const payload = formatQuery("customFilters", params, CUSTOM_FILTER_FULL_PROJECTION());
  return graphql(payload, "FETCH_CUSTOM_FILTER");
}

function getApiUrl() {
  let _baseApiUrl = process.env.REACT_APP_API_URL ?? "/api";
  if (_baseApiUrl.indexOf("/") !== 0) {
    _baseApiUrl = `/${_baseApiUrl}`;
  }
  return _baseApiUrl;
}

export const baseApiUrl = getApiUrl();

function getCsrfToken() {
  const CSRF_TOKEN_NAME = "csrftoken";
  const CSRF_NOT_FOUND = null;

  const cookies = document.cookie;
  const cookieArray = cookies.split("; ");

  const csrfCookie = cookieArray.find((cookie) => cookie.startsWith(CSRF_TOKEN_NAME));
  return csrfCookie?.split("=")[1] ?? CSRF_NOT_FOUND;
}

export function apiHeaders() {
  let headers = {
    "Content-Type": "application/json",
  };
  return headers;
}

export function cacheFilters(key, filters) {
  return (dispatch) => {
    dispatch({ type: "CORE_CACHE_FILTER", payload: { [key]: filters } });
  };
}

export function resetCacheFilters(key) {
  return (dispatch) => {
    dispatch({ type: "CORE_CACHE_FILTER_RESET", payload: key });
  };
}

export function journalize(mutation, meta) {
  return (dispatch) => {
    const toAdd = mutation ? { ...mutation, status: 0 } : { status: 0 };
    dispatch({ type: "CORE_MUTATION_ADD", payload: toAdd, meta });
  };
}

export function fetchMaxLengthConstraints() {
  const payload = formatQuery("maxLengthConstraints", {}, ["constraints"]);
  return graphql(payload, "FETCH_MAX_LENGTH_CONSTRAINTS");
}

function isCsrfError(error) {
  return error?.message?.includes("CSRF token missing or incorrect.");
}

export function graphql(payload, type = "GRAPHQL_QUERY", params = {}) {
  let req = type + "_REQ";
  let resp = type + "_RESP";
  let err = type + "_ERR";
  if (Array.isArray(type)) {
    [req, resp, err] = type;
  }
  return async (dispatch) => {
    try {
      const response = await dispatch(
        fetch({
          endpoint: `${baseApiUrl}/graphql`,
          method: "POST",
          body: JSON.stringify({ query: payload }),
          types: [
            {
              type: req,
              meta: params,
            },
            {
              type: resp,
              meta: params,
            },
            {
              type: err,
              meta: params,
            },
          ],
        }),
      );
      if (response?.error) {
        dispatch(coreAlert(formatServerError(response.payload)));
      }

      const gqlErrors = response?.payload?.errors || [];
      if (isImpersonationError(gqlErrors)) {
        dispatch({ type: "CORE_STOP_IMPERSONATION" });
        dispatch(coreAlert("Impersonation ended", "Invalid impersonation target. Impersonation has been stopped."));
        dispatch(loadUser());
        return response;
      }

      if (isSessionError(null, gqlErrors)) {
        dispatch({ type: "CORE_STOP_IMPERSONATION" });
        await clearExpiredSession();
        dispatch({ type: "CORE_AUTH_LOGOUT" });

        if (!isUnauthenticatedRoute()) {
          await redirectToLogin();
        }

        return;
      }

      return response;
    } catch (err) {
      console.error(err);
      return { error: true, payload: { message: err?.message || "Unknown error" } };
    }
  };
}

export function graphqlWithVariables(operation, variables, type = "GRAPHQL_QUERY", params = {}, customHeaders = {}) {
  let req, resp, err;
  if (Array.isArray(type)) {
    [req, resp, err] = type;
  } else {
    req = type + "_REQ";
    resp = type + "_RESP";
    err = type + "_ERR";
  }
  return async (dispatch) => {
    const response = await dispatch(
      fetch({
        endpoint: `${baseApiUrl}/graphql`,
        method: "POST",
        body: JSON.stringify({ query: operation, variables }),
        headers: {
          ...customHeaders,
        },
        types: [
          {
            type: req,
            meta: params,
          },
          {
            type: resp,
            meta: params,
          },
          {
            type: err,
            meta: params,
          },
        ],
      }),
    );
    return response;
  };
}

export function prepareMutation(operation, input, params = {}) {
  if (!params.clientMutationId) {
    params.clientMutationId = uuid.uuid();
  }

  const variables = {
    input: {
      ...input,
      ...params,
    },
  };

  return { operation, variables, clientMutationId: params.clientMutationId };
}

export function waitForMutation(clientMutationId) {
  return async (dispatch) => {
    let attempts = 0;
    let res;
    do {
      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
      }
      const response = await dispatch(
        graphqlWithVariables(
          `
        query ($clientMutationId: String) {
          mutationLogs (clientMutationId: $clientMutationId) {
            edges {
              node {
                status
                clientMutationId
                jsonContent
                error
              }
            }
          }
        }
      `,
          { clientMutationId },
        ),
      );
      if (response.error) {
        return null;
      }
      res = response.payload.data.mutationLogs?.edges[0]?.node;
    } while ((!res || res.status === 0) && attempts++ < 10);
    if (res && res.status === 1 && res.error) {
      return { ...res, error: JSON.parse(res.error) };
    }
    return res;
  };
}

export function graphqlMutation(
  mutation,
  variables,
  type = "CORE_TRIGGER_MUTATION",
  params = {},
  wait = true,
  customHeaders = {},
) {
  let clientMutationId;
  if (variables?.input) {
    clientMutationId = uuid.uuid();
    variables.input.clientMutationId = clientMutationId;
  }
  return async (dispatch) => {
    const response = await dispatch(graphqlWithVariables(mutation, variables, type, params, customHeaders));
    if (clientMutationId) {
      dispatch(fetchMutation(clientMutationId));
      if (wait) {
        return dispatch(waitForMutation(clientMutationId));
      } else {
        return response?.payload?.data;
      }
    }
    return response;
  };
}

export function fetch(config) {
  // `silent` suppresses the session-expiry dialog on 401 (for boot probes); it
  // must not reach the RSAA action.
  const { silent, ...rsaaConfig } = config;

  // Cookie fallback lets a session authenticated outside /front (e.g. Django) pass CSRF.
  const csrfToken = getLocalStorage("csrfToken") ?? getCsrfToken();

  return async (dispatch, getState) => {
    const state = getState();
    const impersonatedUser = state.core?.impersonatedUser;
    let action;

    try {
      action = await dispatch({
        [RSAA]: {
          ...rsaaConfig,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": csrfToken,
            ...(impersonatedUser && { "X-Impersonate-User": decodeId(impersonatedUser.id) }),
            ...rsaaConfig.headers,
          },
        },
      });

      // Session error detection uses a minimal extraction; full error reporting is consolidated below.
      const payload = action?.payload || {};
      const response = payload?.response;
      const status = response?.status;
      const gqlErrors = payload?.errors || response?.errors || [];

      if (isImpersonationError(gqlErrors)) {
        dispatch({ type: "CORE_STOP_IMPERSONATION" });
        dispatch(coreAlert("Impersonation ended", "Invalid impersonation target. Impersonation has been stopped."));
        dispatch(loadUser());
        return action;
      }

      if (isSessionError(status, gqlErrors)) {
        dispatch({ type: "CORE_STOP_IMPERSONATION" });
        if (isUnauthenticatedRoute() || silent) {
          clearExpiredSession();
          dispatch({ type: "CORE_AUTH_LOGOUT" });
        } else {
          dispatch(
            coreConfirm(
              "Session Expired",
              "Your session has expired, You will be redirected to the login page.",
              "csrf_logout",
            ),
          );
        }
        return action;
      }
    } catch (err) {
      // Synthesize an error action so the single post-try/catch reporting + return path handles it uniformly.
      action = {
        error: true,
        payload: {
          originalError: err,
          message: err?.message || "Network or request failure",
        },
      };
    }

    // Consolidated single location for all Sentry error reporting (action?.error and standalone GQL errors).
    // This runs for normal error responses and for exceptions synthesized in catch.
    const endpoint = config.endpoint;
    const response = action?.payload?.response;
    const status = response?.status;
    const statusText = response?.statusText;
    const gqlErrors = action?.payload?.errors || response?.errors || [];
    const message =
      action?.payload?.message ||
      action?.payload?.originalError?.message ||
      (typeof action?.error === "object" ? action.error.message : undefined);

    if (action?.error) {
      let errorMessage = "";
      if (!response && !message) {
        errorMessage = "Server not responding";
      } else if (status) {
        errorMessage = `HTTP ${status}: ${statusText || "Unknown status"}`;
      } else if (gqlErrors?.length > 0) {
        errorMessage = `GraphQL Error: ${gqlErrors.map((e) => e.message).join("; ")}`;
      } else if (message) {
        errorMessage = `Network or API Error: ${message}`;
      } else {
        errorMessage = "Unknown error during API call";
      }
      console.error(errorMessage, { originalError: action?.payload?.originalError, payload: action?.payload });
      Sentry.captureException(new Error(errorMessage), {
        level: "error",
        tags: {
          endpoint,
          status: status || "no-status",
          type: config.method || "unknown-method",
        },
        extra: {
          endpoint,
          status,
          statusText,
          body: config.body,
          response: action.payload,
        },
      });
    }

    if (!action?.error && gqlErrors?.length > 0) {
      Sentry.captureException(new Error(`GraphQL Error: ${gqlErrors.map((e) => e.message).join("; ")}`), {
        level: "error",
        tags: {
          endpoint,
          type: config.method || "unknown-method",
        },
        extra: {
          endpoint,
          errors: gqlErrors,
          query: config.body,
        },
      });
    }

    return action || { error: true, payload: null };
  };
}

export function loadUser(options = {}) {
  return fetch({
    endpoint: `${baseApiUrl}/core/users/current_user/`,
    method: "GET",
    silent: options.silent,
    types: ["CORE_USERS_CURRENT_USER_REQ", "CORE_USERS_CURRENT_USER_RESP", "CORE_USERS_CURRENT_USER_ERR"],
  });
}

export function saveCurrentUserDefaultRowsPerPage(defaultRowsPerPage, clientMutationLabel = null) {
  return async (dispatch) => {
    try {
      const mutationResult = await dispatch(
        graphqlMutation(
          `
            mutation ($input: ChangeUserDefaultRowsPerPageMutationInput!) {
              changeUserDefaultRowsPerPage(input: $input) {
                internalId
                clientMutationId
              }
            }
          `,
          { input: { defaultRowsPerPage, clientMutationLabel } },
          "PROFILE_DEFAULT_ROWS_PER_PAGE_MUTATION",
          {},
        ),
      );
      if (!mutationResult || mutationResult?.error) return mutationResult;
      return dispatch(loadUser());
    } catch (e) {
      return { 
        error: true, 
        message: e?.message || 'An unexpected error occurred'
      };
    }
  };
}

export function login(credentials) {
  return async (dispatch) => {
    if (credentials) {
      const mutation = `mutation authenticate($username: String!, $password: String!) {
            tokenAuth(username: $username, password: $password) {
              refreshExpiresIn
            }
          }`;

      try {
        const response = await dispatch(
          graphqlMutation(
            mutation,
            credentials,
            ["CORE_AUTH_LOGIN_REQ", "CORE_AUTH_LOGIN_RESP", "CORE_AUTH_ERR"],
            {},
            false,
            {},
          ),
        );
        if (response.payload?.errors?.length > 0) {
          const errorMessage = response.payload.errors[0].message;
          dispatch(authError({ message: errorMessage }));
          return { loginStatus: "CORE_AUTH_ERR", message: errorMessage };
        }

        const jwtToken = response.payload.data.tokenAuth.token;
        const csrfResponse = await dispatch(fetchCsrfToken(jwtToken));
        const csrfToken = csrfResponse?.payload?.data?.getCsrfToken?.csrfToken;
        if (csrfToken) {
          setLocalStorage("csrfToken", csrfToken);
        }

        const action = await dispatch(loadUser());
        return { loginStatus: action.type, message: action?.payload?.response?.detail ?? "" };
      } catch (error) {
        dispatch(authError({ message: error.message }));
        return { loginStatus: "CORE_AUTH_ERR", message: error.message };
      }
    } else {
      if (!hasStoredAuthSession()) {
        dispatch({ type: "CORE_AUTH_LOGOUT" });
        return { loginStatus: "CORE_AUTH_LOGOUT", message: "" };
      }

      const refreshResult = await dispatch(refreshAuthToken());
      const refreshStatus = refreshResult?.payload?.response?.status;
      const refreshErrors = refreshResult?.payload?.errors || refreshResult?.payload?.response?.errors || [];

      if (refreshResult?.error || isSessionError(refreshStatus, refreshErrors)) {
        dispatch({ type: "CORE_STOP_IMPERSONATION" });
        await clearExpiredSession();
        dispatch({ type: "CORE_AUTH_LOGOUT" });
        return { loginStatus: "CORE_AUTH_LOGOUT", message: "" };
      }

      const action = await dispatch(loadUser());
      const loadUserStatus = action?.payload?.response?.status ?? action?.payload?.status;
      const loadUserErrors = action?.payload?.errors || action?.payload?.response?.errors || [];

      if (action?.error || action.type === "CORE_USERS_CURRENT_USER_ERR") {
        if (isSessionError(loadUserStatus, loadUserErrors)) {
          dispatch({ type: "CORE_STOP_IMPERSONATION" });
          await clearExpiredSession();
          dispatch({ type: "CORE_AUTH_LOGOUT" });
          return { loginStatus: "CORE_AUTH_LOGOUT", message: "" };
        }
      }

      return {
        loginStatus: action.type,
        message: action?.payload?.response?.detail ?? "Error occurred while loading user.",
      };
    }
  };
}

export function fetchCsrfToken(jwtToken) {
  return async (dispatch) => {
    const csrfQuery = `mutation {
      getCsrfToken {
        csrfToken
      }
    }`;

    return dispatch(
      graphqlMutation(
        csrfQuery,
        {},
        ["CORE_AUTH_CSRTOKEN_REQ", "CORE_AUTH_CSRTOKEN_RESP", "CORE_AUTH_ERR"],
        {},
        false,
        {
          "Authorization": `JWT ${jwtToken}`,
        },
      ),
    );
  };
}

export function refreshAuthToken() {
  return (dispatch) => {
    const mutation = `
    mutation refreshAuthToken {
      refreshToken {
        refreshExpiresIn
      }
    }
  `;
    return dispatch(graphqlMutation(mutation, {}, "CORE_AUTH_REFRESH_TOKEN"));
  };
}

export function initialize() {
  return async (dispatch) => {
    if (isUnauthenticatedRoute()) {
      dispatch({ type: "CORE_AUTH_LOGOUT" });
      return dispatch({ type: "CORE_INITIALIZED" });
    }

    // Silent probe: a valid auth cookie (/front JWT or Django session)
    // authenticates; an anonymous boot logs out without the expiry dialog.
    const action = await dispatch(loadUser({ silent: true }));
    const status = action?.payload?.response?.status ?? action?.payload?.status;
    const errors = action?.payload?.errors || action?.payload?.response?.errors || [];

    if (action?.error || isSessionError(status, errors)) {
      await clearExpiredSession();
      dispatch({ type: "CORE_AUTH_LOGOUT" });
    } else if (!getLocalStorage("csrfToken")) {
      // Mirror the csrftoken cookie so later mutations send a matching X-CSRFToken.
      const cookieCsrf = getCsrfToken();
      if (cookieCsrf) {
        setLocalStorage("csrfToken", cookieCsrf);
      }
    }

    return dispatch({ type: "CORE_INITIALIZED" });
  };
}

export function authError(error) {
  return {
    type: "CORE_AUTH_ERR",
    payload: error,
  };
}

export function logout() {
  return async (dispatch, getState) => {
    const mutation = `
      mutation logout {
        deleteTokenCookie {
          deleted
        }
        deleteRefreshTokenCookie {
          deleted
        }
      }
    `;
    await dispatch(graphqlMutation(mutation, {}));
    return dispatch({ type: "CORE_AUTH_LOGOUT" });
  };
}

export function fetchPasswordPolicy() {
  const payload = `query {
    passwordPolicy
  }`;
  return graphql(payload, "PASSWORD_POLICY_FIELDS");
}

export function fetchMutation(clientMutationId) {
  const payload = formatPageQuery(
    "mutationLogs",
    [`clientMutationId: "${clientMutationId}"`],
    [
      "id",
      "status",
      "error",
      "clientMutationId",
      "clientMutationLabel",
      "clientMutationDetails",
      "requestDateTime",
      "jsonExt",
      "autogeneratedCode",
    ],
  );
  return graphql(payload, "CORE_MUTATION");
}

export function fetchHistoricalMutations(pageSize, afterCursor) {
  let filters = [`first: ${pageSize}`];
  if (!!afterCursor) {
    filters.push(`after: "${afterCursor}"`);
  }
  filters.push(`orderBy: "-request_date_time"`);
  const payload = formatPageQuery("mutationLogs", filters, [
    "id",
    "status",
    "error",
    "clientMutationId",
    "clientMutationLabel",
    "clientMutationDetails",
    "requestDateTime",
    "jsonExt",
  ]);
  return graphql(payload, "CORE_HISTORICAL_MUTATIONS");
}

export function coreAlert(titleOrObject, message, detail) {
  let payload;

  if (_.isObject(titleOrObject)) {
    payload = titleOrObject;
  } else {
    payload = {
      title: titleOrObject,
      message,
      detail,
    };
  }

  return (dispatch) => {
    dispatch({ type: "CORE_ALERT", payload });
  };
}

export function clearAlert() {
  return (dispatch) => {
    dispatch({ type: "CORE_ALERT_CLEAR" });
  };
}

export function coreConfirm(title, message, intent = null) {
  return (dispatch) => {
    dispatch({ type: "CORE_CONFIRM", payload: { title, message, intent } });
  };
}

export function clearConfirm(confirmed) {
  return (dispatch) => {
    dispatch({ type: "CORE_CONFIRM_CLEAR", payload: confirmed });
  };
}

export function openExportConfigDialog() {
  return (dispatch) => {
    dispatch({ type: "CORE_OPEN_EXPORT_CONFIG_DIALOG" });
  };
}

export function closeExportConfigDialog() {
  return (dispatch) => {
    dispatch({ type: "CORE_CLOSE_EXPORT_CONFIG_DIALOG" });
  };
}

export function fetchRoles(params) {
  const payload = formatPageQueryWithCount("role", params, ROLE_FULL_PROJECTION());
  return graphql(payload, "CORE_ROLES");
}

export function fetchRole(params) {
  const payload = formatPageQuery("role", params, ROLE_FULL_PROJECTION());
  return graphql(payload, "CORE_ROLE");
}

export function fetchRoleRights(params) {
  const payload = formatPageQuery("roleRight", params, ROLERIGHT_FULL_PROJECTION());
  return graphql(payload, "CORE_ROLERIGHTS");
}

export function fetchModulesPermissions() {
  const payload = formatQuery("modulesPermissions", null, MODULEPERMISSION_FULL_PROJECTION());
  return graphql(payload, "CORE_MODULEPERMISSIONS");
}

export function fetchLanguages() {
  let payload = formatQuery("languages", null, LANGUAGE_FULL_PROJECTION());
  return graphql(payload, "CORE_LANGUAGES");
}

function formatRoleGQL(role) {
  return `
        ${!!role.uuid ? `uuid: "${role.uuid}"` : ""}
        ${!!role.name ? `name: "${formatGQLString(role.name)}"` : ""}
        ${!!role.altLanguage ? `altLanguage: "${formatGQLString(role.altLanguage)}"` : ""}
        ${role.isSystem !== null ? `isSystem: ${role.isSystem}` : ""}
        ${role.isBlocked !== null ? `isBlocked: ${role.isBlocked}` : ""}
        ${!!role.roleRights ? `rightsId: [${role.roleRights.join(",")}]` : ""}
    `;
}

export function createRole(role, clientMutationLabel) {
  let mutation = formatMutation("createRole", formatRoleGQL(role), clientMutationLabel);
  var requestedDateTime = new Date().toISOString();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_CREATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateRole(role, clientMutationLabel) {
  let mutation = formatMutation("updateRole", formatRoleGQL(role), clientMutationLabel);
  var requestedDateTime = new Date().toISOString();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_UPDATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function deleteRole(role, clientMutationLabel, clientMutationDetails = null) {
  let roleUuids = `uuids: ["${role.uuid}"]`;
  let mutation = formatMutation("deleteRole", roleUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date().toISOString();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_DELETE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function roleNameValidationCheck(mm, variables) {
  return graphqlWithVariables(
    `
      query ($roleName: String!) {
        isValid: validateRoleName(roleName: $roleName)
      }
    `,
    variables,
    `CORE_ROLE_NAME_VALIDATION_FIELDS`,
  );
}

export function roleNameValidationClear() {
  return (dispatch) => {
    dispatch({ type: `CORE_ROLE_NAME_VALIDATION_FIELDS_CLEAR` });
  };
}

export function roleNameSetValid() {
  return (dispatch) => {
    dispatch({ type: `CORE_ROLE_NAME_VALIDATION_FIELDS_SET_VALID` });
  };
}

export function saveCurrentPaginationPage(page, afterCursor, beforeCursor, module) {
  return (dispatch) => {
    dispatch({ type: "CORE_PAGINATION_PAGE", payload: { page, afterCursor, beforeCursor, module } });
  };
}

export function clearCurrentPaginationPage() {
  return (dispatch) => {
    dispatch({ type: "CORE_PAGINATION_PAGE_CLEAR" });
  };
}

export function toggleCurrentCalendarType(isSecondaryCalendarEnabled) {
  return (dispatch) => {
    dispatch({ type: "CORE_CALENDAR_TYPE_TOGGLE", payload: { isSecondaryCalendarEnabled } });
  };
}

export function changeUserLanguage(language, clientMutationLabel) {
  const mutation = formatMutation("changeUserLanguage", `languageId: "${language}"`, clientMutationLabel);
  const requestedDateTime = new Date().toISOString();

  return graphql(mutation.payload, ["CORE_MUTATION_REQ", "CHANGE_USER_LANGUAGE_RESP", "CORE_MUTATION_ERR"], {
    actionType: "CHANGE_USER_LANGUAGE_RESP",
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function impersonateUser(user) {
  return async (dispatch) => {
    dispatch({ type: "CORE_IMPERSONATE_USER", payload: user });
    await dispatch(loadUser());
  };
}

export function stopImpersonation() {
  return async (dispatch) => {
    dispatch({ type: "CORE_STOP_IMPERSONATION" });
    await dispatch(loadUser());
  };
}

// Re-export API helpers
export { formatPageQuery, formatPageQueryWithCount, formatMutation, decodeId };
