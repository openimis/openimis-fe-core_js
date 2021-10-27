import { RSAA } from "redux-api-middleware";
import _ from "lodash-uuid";
import { formatQuery, formatPageQuery, formatPageQueryWithCount, formatGQLString, formatMutation } from "./helpers/api";

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

export const baseApiUrl = process.env.NODE_ENV === "development" ? "/api" : "/iapi";

export function apiHeaders() {
  let headers = {
    "Content-Type": "application/json",
  };
  if (process.env.NODE_ENV === "development") {
    headers["remote-user"] = "Admin";
    // headers['remote-user'] = "user";
  }
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

export function graphql(payload, type, params = {}) {
  let req = type + "_REQ";
  let resp = type + "_RESP";
  let err = type + "_ERR";
  if (Array.isArray(type)) {
    [req, resp, err] = type;
  }
  return {
    [RSAA]: {
      endpoint: `${baseApiUrl}/graphql`,
      method: "POST",
      headers: apiHeaders(),
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
    },
  };
}

export function graphqlWithVariables(operation, variables, type, params = {}) {
  let req = type + "_REQ";
  let resp = type + "_RESP";
  let err = type + "_ERR";
  if (Array.isArray(type)) {
    [req, resp, err] = type;
  }
  return {
    [RSAA]: {
      endpoint: `${baseApiUrl}/graphql`,
      method: "POST",
      headers: apiHeaders(),
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
    },
  };
}

export function prepareMutation(operation, input, params = {}) {
  if (!params.clientMutationId) {
    params.clientMutationId = _.uuid();
  }

  const variables = {
    input: {
      ...input,
      ...params,
    },
  };

  return { operation, variables, clientMutationId: params.clientMutationId };
}

export function graphqlMutation(mutation, variables, type = "CORE_TRIGGER_MUTATION", params = {}) {
  let clientMutationId;
  if (variables?.input) {
    clientMutationId = _.uuid();
    variables.input.clientMutationId = clientMutationId;
  }
  return async (dispatch) => {
    const response = await dispatch(graphqlWithVariables(mutation, variables, type, params));
    if (clientMutationId) dispatch(fetchMutation(clientMutationId));
    return response;
  };
}

export function auth() {
  return {
    [RSAA]: {
      endpoint: `${baseApiUrl}/core/users/current_user/`,
      method: "GET",
      headers: apiHeaders(),
      types: ["CORE_USERS_CURRENT_USER_REQ", "CORE_USERS_CURRENT_USER_RESP", "CORE_USERS_CURRENT_USER_ERR"],
    },
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

export function coreAlert(title, message, detail) {
  return (dispatch) => {
    dispatch({ type: "CORE_ALERT", payload: { title, message, detail } });
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

export function duplicateRole(role, clientMutationLabel) {
  let mutation = formatMutation("duplicateRole", formatRoleGQL(role), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["CORE_ROLE_MUTATION_REQ", "CORE_DUPLICATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"], {
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
