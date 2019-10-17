import { RSAA } from "redux-api-middleware";
import { formatPageQuery } from "./helpers/api";

export const baseApiUrl = process.env.NODE_ENV === 'development' ? "/api" : "/iapi";

export function apiHeaders() {
    let headers = {
        "Content-Type": "application/json",
    }
    if (process.env.NODE_ENV === 'development') {
        // headers['remote-user'] = "admin";
        headers['remote-user'] = "user";
    }
    return headers;
}

export function journalize(mutation) {
    return dispatch => {
        mutation.status = 0;
        dispatch({ type: 'CORE_MUTATION_ADD', payload: mutation })
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
        ["id", "status", "error", "clientMutationLabel", "requestDateTime"]
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
        ["id", "status", "error", "clientMutationLabel", "requestDateTime"]
    );
    return graphql(payload, 'CORE_HISTORICAL_MUTATIONS');
}

export function coreAlert(title, message) {
    return dispatch => {
        dispatch({ type: 'CORE_ALERT', payload: { title, message } })
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