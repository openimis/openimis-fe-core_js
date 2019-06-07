function headers(store) {
  return new Headers({
    "Content-Type": "application/json",
  });
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

export const baseApiUrl = process.env.REACT_APP_API_URL || "";
