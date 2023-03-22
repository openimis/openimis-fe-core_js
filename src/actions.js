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
} from "./helpers/api";

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

const LANGUAGE_FULL_PROJECTION = () => ["name", "code", "sortOrder"];

const MODULEPERMISSION_FULL_PROJECTION = () => ["modulePermsList{moduleName, permissions{permsName, permsValue}}"];

function getApiUrl() {
  let _baseApiUrl = process.env.REACT_APP_API_URL ?? '/api';
  if (_baseApiUrl.indexOf('/') !== 0) {
    _baseApiUrl = `/${_baseApiUrl}`;
  }
  return _baseApiUrl;
}

export const baseApiUrl = getApiUrl();

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

export function journalize(mutation, meta) {
  return (dispatch) => {
    mutation.status = 0;
    dispatch({ type: "CORE_MUTATION_ADD", payload: mutation, meta });
  };
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
      if (response.error) {
        dispatch(coreAlert(formatServerError(response.payload)));
      }
      return response;
    } catch (err) {
      console.error(err);
    }
  };
}

export function graphqlWithVariables(operation, variables, type = "GRAPHQL_QUERY", params = {}) {
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
      res.error = JSON.parse(res.error);
    }
    return res;
  };
}

export function graphqlMutation(mutation, variables, type = "CORE_TRIGGER_MUTATION", params = {}, wait = true) {
  let clientMutationId;
  if (variables?.input) {
    clientMutationId = uuid.uuid();
    variables.input.clientMutationId = clientMutationId;
  }
  return async (dispatch) => {
    const response = await dispatch(graphqlWithVariables(mutation, variables, type, params));
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
  return async (dispatch) => {
    return dispatch({
      [RSAA]: {
        ...config,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
      },
    });
  };
}

export function loadUser() {
  return fetch({
    endpoint: `${baseApiUrl}/core/users/current_user/`,
    method: "GET",
    types: ["CORE_USERS_CURRENT_USER_REQ", "CORE_USERS_CURRENT_USER_RESP", "CORE_USERS_CURRENT_USER_ERR"],
  });
}

export function login(credentials) {
  return async (dispatch) => {
    if (credentials) {
      // We log in the user using the credentials
      const mutation = `mutation authenticate($username: String!, $password: String!) {
            tokenAuth(username: $username, password: $password) {
              refreshExpiresIn
            }
          }`;
      await dispatch(
        graphqlMutation(mutation, credentials, ["CORE_AUTH_LOGIN_REQ", "CORE_AUTH_LOGIN_RESP", "CORE_AUTH_ERR"]),
      );
    } else {
      // Try to refresh the token using the cookie (if present)
      await dispatch(refreshAuthToken());
    }
    const action = await dispatch(loadUser());
    return action.type !== "CORE_AUTH_ERR";
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
    await dispatch(login());
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

export function fetchMutation(clientMutationId) {
  const payload = formatPageQuery(
    "mutationLogs",
    [`clientMutationId: "${clientMutationId}"`],
    ["id", "status", "error", "clientMutationId", "clientMutationLabel", "clientMutationDetails", "requestDateTime"],
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

export function coreConfirm(title, message) {
  return (dispatch) => {
    dispatch({ type: "CORE_CONFIRM", payload: { title, message } });
  };
}

export function clearConfirm(confirmed) {
  return (dispatch) => {
    dispatch({ type: "CORE_CONFIRM_CLEAR", payload: confirmed });
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
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_CREATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateRole(role, clientMutationLabel) {
  let mutation = formatMutation("updateRole", formatRoleGQL(role), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_UPDATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function deleteRole(role, clientMutationLabel, clientMutationDetails = null) {
  let roleUuids = `uuids: ["${role.uuid}"]`;
  let mutation = formatMutation("deleteRole", roleUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
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
    dispatch({ type: "CORE_PAGINATION_PAGE", payload: { page, afterCursor, beforeCursor, module} });
  };
}

export function clearCurrentPaginationPage() {
  return (dispatch) => {
    dispatch({ type: "CORE_PAGINATION_PAGE_CLEAR" })
  }
}
