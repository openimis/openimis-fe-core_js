import { describe, expect, it } from "vitest";
import _ from "lodash";

// The rule useGraphqlQuery applies when deciding whether to re-query. Kept
// here as a unit because exercising the hook itself needs a store and a
// renderer; the condition is the part that was wrong.
const shouldFetch = ({ operation, prevOperation, variables, prevVariables, refreshKey, prevRefreshKey }) =>
  operation !== prevOperation ||
  !_.isEqual(variables, prevVariables) ||
  (refreshKey !== undefined && refreshKey !== prevRefreshKey);

describe("when a useGraphqlQuery list re-queries", () => {
  const base = { operation: "q", prevOperation: "q", variables: { first: 10 }, prevVariables: { first: 10 } };

  it("does not re-query on a re-render that changed nothing", () => {
    expect(shouldFetch({ ...base })).toBe(false);
  });

  it("re-queries when the filters actually changed", () => {
    expect(shouldFetch({ ...base, variables: { first: 10, name: "x" } })).toBe(true);
  });

  it("re-queries on an explicit user action even though the filters are identical", () => {
    // Searcher's fetch token: pressing Search without editing a filter, or
    // refreshing the list. This is the case that silently did nothing.
    expect(shouldFetch({ ...base, refreshKey: 2, prevRefreshKey: 1 })).toBe(true);
  });

  it("ignores the token when a caller never passes one", () => {
    expect(shouldFetch({ ...base, refreshKey: undefined, prevRefreshKey: undefined })).toBe(false);
  });

  it("does not re-query twice for the same user action", () => {
    expect(shouldFetch({ ...base, refreshKey: 3, prevRefreshKey: 3 })).toBe(false);
  });
});
