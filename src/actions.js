import { RSAA } from "redux-api-middleware";
import {
    formatQuery,
    formatPageQuery,
    formatPageQueryWithCount,
    formatGQLString,
    formatMutation
} from "./helpers/api";

const ROLE_FULL_PROJECTION = () => [
    "id",
    "uuid",
    "name",
    "altLanguage",
    "isSystem",
    "isBlocked",
    "validityFrom",
    "validityTo"
];

const MODULEPERMISSION_FULL_PROJECTION = () => [
    "modulePermsList{moduleName, permissions{permsName, permsValue}}"
];

export const baseApiUrl = process.env.NODE_ENV === 'development' ? "/api" : "/iapi";

export function apiHeaders() {
    let headers = {
        "Content-Type": "application/json",
    }
    if (process.env.NODE_ENV === 'development') {
        headers['remote-user'] = "Admin";
        // headers['remote-user'] = "user";
    }
    return headers;
}


export function cacheFilters(key, filters) {
    return dispatch => {
        dispatch({ type: 'CORE_CACHE_FILTER', payload: { [key]: filters } })
    }
}

export function journalize(mutation, meta) {
    return dispatch => {
        mutation.status = 0;
        dispatch({ type: 'CORE_MUTATION_ADD', payload: mutation, meta })
    }
}

export function graphql(payload, type, params = {}) {
    let req = type + '_REQ';
    let resp = type + '_RESP';
    let err = type + '_ERR';
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
                }, {
                    type: resp,
                    meta: params,
                }, {
                    type: err,
                    meta: params,
                }
            ],
        },
    };
}

export function auth() {
    return {
        [RSAA]: {
            endpoint: `${baseApiUrl}/core/users/current_user/`,
            method: "GET",
            headers: apiHeaders(),
            types: [
                'CORE_USERS_CURRENT_USER_REQ',
                'CORE_USERS_CURRENT_USER_RESP',
                'CORE_USERS_CURRENT_USER_ERR'
            ],
        },
    };
}

export function fetchMutation(id) {
    const payload = formatPageQuery("mutationLogs",
        [`id: "${id}"`],
        ["id", "status", "error", "clientMutationId", "clientMutationLabel", "clientMutationDetails", "requestDateTime"]
    );
    return graphql(payload, 'CORE_MUTATION');
}

export function fetchHistoricalMutations(pageSize, afterCursor) {
    let filters = [`first: ${pageSize}`]
    if (!!afterCursor) {
        filters.push(`after: "${afterCursor}"`)
    }
    filters.push(`orderBy: "-request_date_time"`);
    const payload = formatPageQuery("mutationLogs",
        filters,
        ["id", "status", "error", "clientMutationLabel", "clientMutationDetails", "requestDateTime"]
    );
    return graphql(payload, 'CORE_HISTORICAL_MUTATIONS');
}

export function coreAlert(title, message, detail) {
    return dispatch => {
        dispatch({ type: 'CORE_ALERT', payload: { title, message, detail } })
    }
}

export function clearAlert() {
    return dispatch => {
        dispatch({ type: 'CORE_ALERT_CLEAR' })
    }
}

export function coreConfirm(title, message) {
    return dispatch => {
        dispatch({ type: 'CORE_CONFIRM', payload: { title, message } })
    }
}

export function clearConfirm(confirmed) {
    return dispatch => {
        dispatch({ type: 'CORE_CONFIRM_CLEAR', payload: confirmed })
    }
}

export function fetchRoles(params) {
    const payload = formatPageQueryWithCount(
        "role",
        params,
        ROLE_FULL_PROJECTION()
    );
    return graphql(payload, "CORE_ROLES");
}

export function fetchModulesPermissions() {
    const payload = formatQuery(
        "modulesPermissions",
        null,
        MODULEPERMISSION_FULL_PROJECTION()
    );
    return graphql(payload, "CORE_MODULEPERMISSIONS");
}

function formatRoleGQL(role) {
    return `
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
    return graphql(
        mutation.payload,
        ["CORE_ROLE_MUTATION_REQ", "CORE_CREATE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function deleteRole(role, clientMutationLabel, clientMutationDetails = null) {
    let roleUuids = `uuids: ["${role.uuid}"]`;
    let mutation = formatMutation("deleteRole", roleUuids, clientMutationLabel, clientMutationDetails);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CORE_ROLE_MUTATION_REQ", "CORE_DELETE_ROLE_RESP", "CORE_ROLE_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}
