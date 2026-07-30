import React from "react";
import _ from "lodash-uuid";
import { IconButton } from "@mui/material";
import GetIconComponent from "./icons";
import { clearLocalStorage } from "./useLocalStorage";

const SortIcon = GetIconComponent("UnfoldMore");
const SortAscIcon = GetIconComponent("ExpandLess");
const SortDescIcon = GetIconComponent("ExpandMore");

function _entityAndFilters(entity, filters) {
  return `${entity}${!!filters && filters.length ? `(${filters.join(",")})` : ""}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getOperationName(operation, entity) {
  return `${operation}${capitalize(entity)}`;
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
query ${getOperationName("Get", entity)} {
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
query ${getOperationName("Get", "node")} {
  node (id: "${nodeId}") {
    ...on ${entityGQLType} {
      ${projections.join(",")}
    }
  }
}
`;
}

export function formatPageQuery(entity, filters, projections) {
  return `
query ${getOperationName("Get", entity)} {
  ${_entityAndFilters(entity, filters)}
  {
    ${_pageAndEdges(projections)}
  }
}`;
}

export function formatPageQueryWithCount(entity, filters, projections) {
  return `
query ${getOperationName("Get", entity)} {
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
    mutation ${operationName} {
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
  const meta = action.meta || {};
  // Sanitize common non-serializable values (e.g. Date objects from older call sites)
  const requestedDateTime =
    meta.requestedDateTime instanceof Date ? meta.requestedDateTime.toISOString() : meta.requestedDateTime;
  const cleanMeta = {
    ...meta,
    requestedDateTime,
    id: meta.id || meta.clientMutationId || null,
  };
  return {
    ...state,
    submittingMutation: true,
    mutation: cleanMeta,
  };
}

export function dispatchMutationResp(state, service, action) {
  const prevMutation = state.mutation || {};
  const mutation = {
    ...prevMutation,
    id: action.payload?.data?.[service]?.internalId ?? prevMutation.id ?? null,
  };
  return {
    ...state,
    submittingMutation: false,
    mutation: {
      ...state.mutation,
      id: action.payload?.data?.[service]?.internalId,
    },
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

const SESSION_ERROR_MESSAGES = new Set([
  "csrftoken",
  "unauthorized",
  "user not authorized for this operation",
  "authentication credentials were not provided",
  "csrf token missing or incorrect",
  "error decoding signature",
  "invalid token",
  "not authenticated",
]);

export const normalizeGraphqlErrorMessage = (message) =>
  String(message || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .trim();

export const isSessionError = (status, gqlErrors = []) => {
  if (status === 401) {
    return true;
  }

  return gqlErrors.some((error) => {
    const message = normalizeGraphqlErrorMessage(error?.message);
    return (
      SESSION_ERROR_MESSAGES.has(message) ||
      message.includes("csrf token missing or incorrect") ||
      message.includes("authentication credentials were not provided")
    );
  });
};

export const isImpersonationError = (gqlErrors = []) => {
  return gqlErrors.some((error) => {
    const message = normalizeGraphqlErrorMessage(error?.message);
    return message.includes("invalid impersonation target");
  });
};

const LOGOUT_MUTATION = `
  mutation {
    deleteTokenCookie {
      deleted
    }
    deleteRefreshTokenCookie {
      deleted
    }
  }
`;

function getApiUrl() {
  let baseApiUrl = process.env.REACT_APP_API_URL ?? "/api";
  if (baseApiUrl.indexOf("/") !== 0) {
    baseApiUrl = `/${baseApiUrl}`;
  }
  return baseApiUrl;
}

export const clearExpiredSession = async () => {
  if (typeof window === "undefined") {
    return;
  }

  clearLocalStorage();

  try {
    await fetch(`${getApiUrl()}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query: LOGOUT_MUTATION }),
    });
  } catch (error) {
    console.warn("Failed to clear auth cookies", error);
  }
};

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
