import { RSAA } from "redux-api-middleware";
import { formatPageQuery } from "./helpers/api";

export const baseApiUrl = process.env.NODE_ENV === 'development' ? "/api" : "/iapi";

export function apiHeaders() {
    let headers = {
        "Content-Type": "application/json",
    }
    if (process.env.NODE_ENV === 'development') {
        headers['remote-user'] = "admin";
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
    return {
        [RSAA]: {
            endpoint: `${baseApiUrl}/graphql`,
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify({ query: payload }),
            types: [
                {
                    type: type + '_REQ',
                    meta: params,
                }, {
                    type: type + '_RESP',
                    meta: params,
                }, {
                    type: type + '_ERR',
                    meta: params,
                }
            ],
        },
    };
}

export function auth() {
    return {
        [RSAA]: {
            endpoint: `${baseApiUrl}/core/users/current_user`,
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

export function fetchHistoricalMutations() {
    const payload = formatPageQuery("mutationLogs",
    null,
    ["id", "status", "error", "clientMutationLabel", "requestDateTime"]
  );
  return graphql(payload, 'CORE_HISTORICAL_MUTATIONS');
}