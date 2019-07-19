export function apiHeaders() {
  let headers = {
    "Content-Type": "application/json",
  }
  if (process.env.NODE_ENV === 'development') {
    headers['remote-user'] = "admin";
  }
  return headers;  
}

function handleJsonResponse(response) {
  if (response.status === 204) return;
  let success = response.ok;
  return response.json().then(function(obj) {
    if (success) {
      return obj;
    } else {
      throw Error(obj.errors || response.statusText);
    }
  });
}

export function get(name, opts) {
  return fetch(route(name, opts), {
    method: "get",
    headers: headers(),
  }).then(handleJsonResponse);
}

export function put(name, opts) {
  return fetch(route(name, opts), {
    method: "put",
    headers: headers(),
  }).then(handleJsonResponse);
}

export function post(name, opts, params = {}) {
  return fetch(route(name, opts), {
    method: "post",
    headers: headers(),
    body: JSON.stringify(params),
  }).then(handleJsonResponse);
}

export function destroy(name, opts, params = {}) {
  return fetch(route(name, opts), {
    method: "delete",
    headers: headers(),
    body: JSON.stringify(params),
  }).then(handleJsonResponse);
}

export const baseApiUrl = process.env.NODE_ENV === 'development' ? "/api" : "/iapi";
