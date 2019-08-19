import _ from "lodash";

function _entityAndFilters(entity, filters) {
  return `${entity}${!!filters && filters.length ? `(${filters.join(',')})` : ""}`
}

function _pageAndEdges(projections) {
  return `
    pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}
    edges
    {
      node
      {
        ${projections.join(',')}
      }
    }`
}

export function formatQuery(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      {
        ${projections.join(',')}
      }
    }`
}

export function formatPageQuery(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      {
        ${_pageAndEdges(projections)}
      }
    }`
}

export function formatPageQueryWithCount(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      {
        totalCount
        ${_pageAndEdges(projections)}
      }
    }`
}

export function decodeId(id) {
  if (/\d+/.test(id)) return id
  else return atob(id).split(':')[1];
}

// export function encodeId(modulesManager, type, id) {
//   return btoa(`${modulesManager.getConf(type)}:${id}`);
// }

export function parseData(data) {
  return data['edges'].map(e => e['node']);
}

export function pageInfo(data) {
  return {totalCount: data['totalCount'], ...data['pageInfo']};
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


