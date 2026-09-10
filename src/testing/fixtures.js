export const relayPage = (nodes = [], { totalCount, pageInfo } = {}) => ({
  totalCount: totalCount ?? nodes.length,
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null, ...pageInfo },
  edges: nodes.map((node) => ({ node })),
});

export const graphqlErrors = (...messages) => ({ errors: messages.map((message) => ({ message })) });

export const serverError = (status = 500, statusText = "Internal Server Error", ...messages) => ({
  status,
  statusText,
  response: messages.length ? { errors: messages.map((message) => ({ message })) } : undefined,
});

export const globalId = (type, id) => btoa(`${type}:${id}`);
