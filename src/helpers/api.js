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
