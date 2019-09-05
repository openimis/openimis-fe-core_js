import _ from "lodash-uuid";

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

export function formatMutation(service, input, clientMutationLabel) {
  const clientMutationId = _.uuid();
  const payload = `
    mutation {
      ${service}(
        input: {
          clientMutationId: "${clientMutationId}"
          clientMutationLabel: "${clientMutationLabel}"
          ${input.trim()}
        }
      ) {
        clientMutationId
        internalId
      }
    }`
  return { clientMutationId, payload }
}

export function decodeId(id) {
  if (/^\d+$/.test(id)) return id
  else return atob(id).split(':')[1];
}

export function encodeId(modulesManager, module, type, id) {
  return btoa(`${modulesManager.getConf(`fe-${module}`, type)}:${id}`);
}

export function parseData(data) {
  return data['edges'].map(e => e['node']);
}

export function dispatchMutationReq(state, action) {
  return {
    ...state,
    submittingMutation: true,
    mutation: action.meta,
  }
}

export function dispatchMutationResp(state, service, action) {
  var mutation = state.mutation;
  mutation.id = action.payload.data[service].internalId;
  return {
    ...state,
    submittingMutation: false,
    mutation,
  }
}

export function dispatchMutationErr(state, action) {
  return {
    ...state,
  }
}

export function pageInfo(data) {
  return { totalCount: data['totalCount'], ...data['pageInfo'] };
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


