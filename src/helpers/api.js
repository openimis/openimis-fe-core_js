import React from "react";
import _ from "lodash-uuid";
import { IconButton } from "@material-ui/core";
import SortIcon from "@material-ui/icons/UnfoldMore";
import SortAscIcon from "@material-ui/icons/ExpandLess";
import SortDescIcon from "@material-ui/icons/ExpandMore";

function _entityAndFilters(entity, filters) {
  return `${entity}${!!filters && filters.length ? `(${filters.join(",")})` : ""}`;
}

function _pageAndEdges(projections) {
  return `
    pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}
    edges
    {
      node
      {
        ${projections.join(",")}
      }
    }`;
}

export function formatQuery(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      ${
        !!projections
          ? `{
        ${projections.join(",")}
      }`
          : ""
      }
    }`;
}

export function formatNodeQuery(entityGQLType, nodeId, projections = ["id"]) {
  return `
  {
    node (id: "${nodeId}") {
      ...on ${entityGQLType} {
        ${projections.join(',')}
      }
    }
  }
  `
}

export function formatPageQuery(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      {
        ${_pageAndEdges(projections)}
      }
    }`;
}

export function formatPageQueryWithCount(entity, filters, projections) {
  return `
    {
      ${_entityAndFilters(entity, filters)}
      {
        totalCount
        ${_pageAndEdges(projections)}
      }
    }`;
}

export function formatGQLString(str) {
  if (!str) return str;
  return str
    .replace(/[\"]/g, '\\"')
    .replace(/[\\]/g, "\\\\")
    .replace(/[\/]/g, "\\/")
    .replace(/[\b]/g, "\\b")
    .replace(/[\f]/g, "\\f")
    .replace(/[\n]/g, "\\n")
    .replace(/[\r]/g, "\\r")
    .replace(/[\t]/g, "\\t");
}

export function formatMutation(operationName, input, clientMutationLabel, clientMutationDetails) {
  const clientMutationId = _.uuid();
  const payload = `
    mutation {
      ${operationName}(
        input: {
          clientMutationId: "${clientMutationId}"
          clientMutationLabel: "${clientMutationLabel}"
          ${!!clientMutationDetails ? `clientMutationDetails: ${JSON.stringify(clientMutationDetails)}` : ""}
          ${input.trim()}
        }
      ) {
        clientMutationId
        internalId
      }
    }`;
  return { clientMutationId, payload };
}

export function decodeId(id) {
  if (/^\d+$/.test(id)) return id;
  else return atob(id).split(":")[1];
}

export function encodeId(modulesManager, type, id) {
  return btoa(`${modulesManager.getRef(type)}:${id}`);
}

export function parseData(data) {
  if (!data) return [];
  return data["edges"].map((e) => e["node"]);
}

export function dispatchMutationReq(state, action) {
  return {
    ...state,
    submittingMutation: true,
    mutation: action.meta,
  };
}

export function dispatchMutationResp(state, service, action) {
  var mutation = state.mutation;
  mutation.id = action.payload.data[service].internalId;
  return {
    ...state,
    submittingMutation: false,
    mutation,
  };
}

export function dispatchMutationErr(state, action) {
  return {
    ...state,
    alert: JSON.stringify(action.payload),
  };
}

export function pageInfo(data) {
  if (!data) return {};
  return { totalCount: data["totalCount"], ...data["pageInfo"] };
}

export function formatServerError(payload) {
  return {
    code: payload.status,
    message: payload.statusText,
    detail:
      !!payload.response && payload.response.errors ? payload.response.errors.map((e) => e.message).join("; ") : null,
  };
}

export function formatGraphQLError(payload) {
  return !payload.errors
    ? null
    : {
        code: "Data error",
        message: "Server returned data error status",
        detail: payload.errors.map((e) => e.message).join("; "),
      };
}

export function openBlob(data, filename, mime) {
  var a = document.createElement("a");
  a.style = "display: none";
  var blob = new Blob([data], { type: `application/${mime}` });
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

export function sort(orderBy, attr, asc = true) {
  let targetSort = null;
  if (orderBy === attr) {
    targetSort = "-" + attr;
  } else if (orderBy === "-" + attr) {
    targetSort = attr;
  } else {
    targetSort = asc ? attr : "-" + attr;
  }
  return targetSort;
}

export function formatSorter(orderBy, attr, asc) {
  if (orderBy === attr) {
    return (
      <IconButton size="small">
        <SortAscIcon size={24} />
      </IconButton>
    );
  } else if (orderBy === "-" + attr) {
    return (
      <IconButton size="small">
        <SortDescIcon size={24} />
      </IconButton>
    );
  } else {
    return (
      <IconButton size="small">
        <SortIcon size={24} />
      </IconButton>
    );
  }
}
