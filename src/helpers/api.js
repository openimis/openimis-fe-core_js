import _ from "lodash";

export function formatQuery(entity, filters, projections) {
  return `
  {
    ${entity}${!!filters && filters.length ? `(${filters.join(',')})` : ""}
    {
      ${projections.join(',')}
    }
  }`
}

export function formatPageQuery(entity, filters, projections) {
  return `
    {
      ${entity}${!!filters && filters.length ? `(${filters.join(',')})` : ""}
      {
        edges
        {
          node
          {
            ${projections.join(',')}
          }
        }
      }
    }`
}

export function decodeId(id) {
  if (/\d+/.test(id)) return id
  else return atob(id).split(':')[1];
}

export function encodeId(modulesManager, type, id) {
  return btoa(`${modulesManager.getRef(type)}:${id}`);
}

export function parseData(data) {
  return data['edges'].map(e => e['node']);
}

export function formatServerError(payload) {
  return {
    code: payload.status,
    message: payload.statusText,
    detail: !!payload.response && payload.response.errors ?
      payload.response.errors.map((e) => e.message).join('; ')
      : null
  }
}

export function formatGraphQLError(payload) {
  return !payload.errors ? null : {
    code: "Data error",
    message: "Server returned data error status",
    detail: payload.errors.map((e) => e.message).join('; ')
  }
}


