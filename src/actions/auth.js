import { RSAA } from "redux-api-middleware";
import { baseApiUrl, apiHeaders } from "./api";

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
  