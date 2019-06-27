import { RSAA } from "redux-api-middleware";
import { baseApiUrl } from "./api";

export function auth() {
    return {
      [RSAA]: {
        endpoint: `${baseApiUrl}/core/users/current_user`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        types: [
          'CORE_USERS_CURRENT_USER_REQ',
          'CORE_USERS_CURRENT_USER_RESP',
          'CORE_USERS_CURRENT_USER_ERR'
        ],
      },
    };
  }
  