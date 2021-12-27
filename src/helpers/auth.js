import { JWT_REFRESH_TOKEN_KEY } from "../constants";

export function getRefreshToken() {
  return localStorage.getItem(JWT_REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  return localStorage.setItem(JWT_REFRESH_TOKEN_KEY, token);
}
