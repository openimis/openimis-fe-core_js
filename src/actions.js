import { RSAA } from "redux-api-middleware";

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

export function graphql(payload, type) {
    return {
      [RSAA]: {
        endpoint: `${baseApiUrl}/graphql`,
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ "query": payload }),
        types: [
          type+'_REQ',
          type+'_RESP',
          type+'_ERR'
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
