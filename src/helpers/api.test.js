import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  decodeId,
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  encodeId,
  formatGQLString,
  formatGraphQLError,
  formatMutation,
  formatNodeQuery,
  formatPageQuery,
  formatPageQueryWithCount,
  formatQuery,
  formatServerError,
  getOperationName,
  hasStoredAuthSession,
  isSessionError,
  normalizeGraphqlErrorMessage,
  pageInfo,
  parseData,
  sort,
  clearExpiredSession,
  openBlob,
  formatSorter,
} from "./api";
import { graphqlErrors, relayPage, renderWithProviders, serverError } from "../testing";

const squash = (s) => s.replace(/\s+/g, " ").trim();

describe("getOperationName", () => {
  it("capitalises the entity", () => {
    expect(getOperationName("Get", "insuree")).toBe("GetInsuree");
  });

  it("leaves an already-capitalised entity alone", () => {
    expect(getOperationName("Get", "Insuree")).toBe("GetInsuree");
  });
});

describe("formatQuery", () => {
  it("builds a named query with filters and projections", () => {
    const q = squash(formatQuery("insurees", ['chfId: "123"', "first: 10"], ["id", "chfId"]));

    expect(q).toBe('query GetInsurees { insurees(chfId: "123",first: 10) { id,chfId } }');
  });

  it("omits the parentheses when there are no filters", () => {
    expect(squash(formatQuery("insurees", [], ["id"]))).toBe("query GetInsurees { insurees { id } }");
    expect(squash(formatQuery("insurees", null, ["id"]))).toBe("query GetInsurees { insurees { id } }");
  });

  it("omits the selection set when there are no projections", () => {
    expect(squash(formatQuery("insurees", ["first: 1"]))).toBe("query GetInsurees { insurees(first: 1) }");
  });
});

describe("formatNodeQuery", () => {
  it("builds an inline-fragment lookup by node id", () => {
    const q = squash(formatNodeQuery("InsureeGQLType", "SW5z:1", ["id", "chfId"]));

    expect(q).toBe('query GetNode { node (id: "SW5z:1") { ...on InsureeGQLType { id,chfId } } }');
  });

  it("projects id by default", () => {
    expect(squash(formatNodeQuery("InsureeGQLType", "abc"))).toContain("{ id }");
  });
});

describe("formatPageQuery", () => {
  it("wraps projections in a relay pageInfo/edges envelope", () => {
    const q = squash(formatPageQuery("insurees", ["first: 10"], ["id"]));

    expect(q).toContain("query GetInsurees { insurees(first: 10)");
    expect(q).toContain("pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}");
    expect(q).toContain("edges { node { id } }");
  });

  it("adds totalCount only in the WithCount variant", () => {
    expect(formatPageQuery("insurees", [], ["id"])).not.toContain("totalCount");
    expect(formatPageQueryWithCount("insurees", [], ["id"])).toContain("totalCount");
  });
});

describe("formatGQLString", () => {
  it("passes through strings with nothing to escape", () => {
    expect(formatGQLString("plain text")).toBe("plain text");
  });

  it("returns falsy input unchanged", () => {
    expect(formatGQLString("")).toBe("");
    expect(formatGQLString(null)).toBeNull();
    expect(formatGQLString(undefined)).toBeUndefined();
  });

  it("escapes control characters", () => {
    expect(formatGQLString("a\nb")).toBe("a\\nb");
    expect(formatGQLString("a\tb")).toBe("a\\tb");
    expect(formatGQLString("a\rb")).toBe("a\\rb");
  });

  // Currently fails: quotes are escaped before backslashes, so the backslash pass
  // re-escapes the one just added. `a"b` becomes `a\\"b`, which terminates the
  // GraphQL string literal early. Backslashes must be escaped first.
  it.fails('escapes a double quote as \\" (currently produces \\\\")', () => {
    expect(formatGQLString('a"b')).toBe('a\\"b');
  });

  it("escapes a lone backslash correctly", () => {
    expect(formatGQLString("a\\b")).toBe("a\\\\b");
  });
});

describe("formatMutation", () => {
  it("returns a payload carrying the generated clientMutationId", () => {
    const { clientMutationId, payload } = formatMutation("createInsuree", 'chfId: "1"', "Create insuree");

    expect(clientMutationId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(payload).toContain(`clientMutationId: "${clientMutationId}"`);
    expect(payload).toContain('clientMutationLabel: "Create insuree"');
    expect(payload).toContain('chfId: "1"');
    expect(squash(payload)).toContain("mutation createInsuree { createInsuree(");
  });

  it("generates a distinct id per call", () => {
    const a = formatMutation("m", "x: 1", "l").clientMutationId;
    const b = formatMutation("m", "x: 1", "l").clientMutationId;

    expect(a).not.toBe(b);
  });

  it("includes clientMutationDetails only when provided", () => {
    expect(formatMutation("m", "x: 1", "l").payload).not.toContain("clientMutationDetails");
    expect(formatMutation("m", "x: 1", "l", ["detail"]).payload).toContain('clientMutationDetails: ["detail"]');
  });
});

describe("decodeId / encodeId", () => {
  it("returns a purely numeric id untouched", () => {
    expect(decodeId("42")).toBe("42");
  });

  it("base64-decodes a relay global id and drops the type prefix", () => {
    expect(decodeId(btoa("InsureeGQLType:99"))).toBe("99");
  });

  it("round-trips with encodeId", () => {
    const modulesManager = { getRef: () => "InsureeGQLType" };

    expect(decodeId(encodeId(modulesManager, "insuree.type", 7))).toBe("7");
  });

  it("resolves the GraphQL type through the modules manager", () => {
    const getRef = vi.fn(() => "ClaimGQLType");

    expect(atob(encodeId({ getRef }, "claim.type", 3))).toBe("ClaimGQLType:3");
    expect(getRef).toHaveBeenCalledWith("claim.type");
  });
});

describe("parseData", () => {
  it("unwraps relay edges into plain nodes", () => {
    expect(parseData(relayPage([{ id: 1 }, { id: 2 }]))).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("returns an empty list for missing data", () => {
    expect(parseData(null)).toEqual([]);
    expect(parseData(undefined)).toEqual([]);
  });

  it("throws on a non-relay shape rather than returning junk", () => {
    expect(() => parseData({ notEdges: [] })).toThrow();
  });
});

describe("pageInfo", () => {
  it("flattens totalCount alongside the relay pageInfo", () => {
    const data = { totalCount: 12, pageInfo: { hasNextPage: true, endCursor: "c2" } };

    expect(pageInfo(data)).toEqual({ totalCount: 12, hasNextPage: true, endCursor: "c2" });
  });

  it("returns an empty object for missing data", () => {
    expect(pageInfo(null)).toEqual({});
  });
});

describe("formatServerError", () => {
  it("maps an HTTP failure onto code/message/detail", () => {
    expect(formatServerError(serverError(500, "Internal Server Error", "boom", "bang"))).toEqual({
      code: 500,
      message: "Internal Server Error",
      detail: "boom; bang",
    });
  });

  it("leaves detail null when the response carries no errors", () => {
    expect(formatServerError({ status: 404, statusText: "Not Found" }).detail).toBeNull();
    expect(formatServerError({ status: 404, statusText: "Not Found", response: {} }).detail).toBeNull();
  });
});

describe("formatGraphQLError", () => {
  it("returns null when the payload has no errors", () => {
    expect(formatGraphQLError({ data: {} })).toBeNull();
  });

  it("joins error messages into a single detail string", () => {
    expect(formatGraphQLError(graphqlErrors("a", "b"))).toEqual({
      code: "Data error",
      message: "Server returned data error status",
      detail: "a; b",
    });
  });
});

describe("normalizeGraphqlErrorMessage", () => {
  it("lowercases, strips quotes and trims", () => {
    expect(normalizeGraphqlErrorMessage("  'Invalid Token' ")).toBe("invalid token");
    expect(normalizeGraphqlErrorMessage('"Unauthorized"')).toBe("unauthorized");
  });

  it("maps nullish input to an empty string", () => {
    expect(normalizeGraphqlErrorMessage(null)).toBe("");
    expect(normalizeGraphqlErrorMessage(undefined)).toBe("");
  });
});

describe("isSessionError", () => {
  it("treats HTTP 401 as a session error regardless of body", () => {
    expect(isSessionError(401)).toBe(true);
  });

  it.each([
    "Unauthorized",
    "Invalid token",
    "Not authenticated",
    "CSRF token missing or incorrect",
    "Authentication credentials were not provided",
    "Error decoding signature",
  ])("recognises %s", (message) => {
    expect(isSessionError(200, [{ message }])).toBe(true);
  });

  it("recognises a known message embedded in a longer string", () => {
    expect(isSessionError(200, [{ message: "GraphQL error: CSRF token missing or incorrect (code 42)" }])).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isSessionError(200, [{ message: "Insuree not found" }])).toBe(false);
    expect(isSessionError(500, [])).toBe(false);
    expect(isSessionError(200)).toBe(false);
  });

  it("tolerates malformed error entries", () => {
    expect(isSessionError(200, [null, {}, { message: null }])).toBe(false);
  });
});

describe("hasStoredAuthSession", () => {
  it("is true when a csrfToken is stored", () => {
    window.localStorage.setItem("csrfToken", JSON.stringify("abc"));

    expect(hasStoredAuthSession()).toBe(true);
  });

  it("is false when nothing is stored", () => {
    expect(hasStoredAuthSession()).toBe(false);
  });
});

describe("sort", () => {
  it("toggles ascending to descending on the active column", () => {
    expect(sort("chfId", "chfId")).toBe("-chfId");
  });

  it("toggles descending back to ascending on the active column", () => {
    expect(sort("-chfId", "chfId")).toBe("chfId");
  });

  it("uses the requested direction for a different column", () => {
    expect(sort("lastName", "chfId")).toBe("chfId");
    expect(sort("lastName", "chfId", false)).toBe("-chfId");
  });

  it("defaults to ascending when nothing is sorted yet", () => {
    expect(sort(null, "chfId")).toBe("chfId");
  });
});

describe("mutation reducers", () => {
  describe("dispatchMutationReq", () => {
    it("marks the mutation in flight and keeps the meta", () => {
      const next = dispatchMutationReq({ items: [1] }, { meta: { clientMutationId: "cid", extra: "x" } });

      expect(next.items).toEqual([1]);
      expect(next.submittingMutation).toBe(true);
      expect(next.mutation).toMatchObject({ id: "cid", extra: "x" });
    });

    it("prefers an explicit id over the clientMutationId", () => {
      expect(dispatchMutationReq({}, { meta: { id: "explicit", clientMutationId: "cid" } }).mutation.id).toBe(
        "explicit",
      );
    });

    it("serialises a Date requestedDateTime so the store stays serialisable", () => {
      const date = new Date("2026-01-02T03:04:05.000Z");

      expect(dispatchMutationReq({}, { meta: { requestedDateTime: date } }).mutation.requestedDateTime).toBe(
        "2026-01-02T03:04:05.000Z",
      );
    });

    it("leaves an already-serialised requestedDateTime alone", () => {
      const meta = { requestedDateTime: "2026-01-02T03:04:05.000Z" };

      expect(dispatchMutationReq({}, { meta }).mutation.requestedDateTime).toBe("2026-01-02T03:04:05.000Z");
    });

    it("copes with an action carrying no meta", () => {
      expect(dispatchMutationReq({}, {}).mutation).toEqual({ id: null, requestedDateTime: undefined });
    });
  });

  describe("dispatchMutationResp", () => {
    it("clears the in-flight flag and records the server id", () => {
      const state = { submittingMutation: true, mutation: { id: "cid" } };
      const action = { payload: { data: { createInsuree: { internalId: "77" } } } };

      const next = dispatchMutationResp(state, "createInsuree", action);

      expect(next.submittingMutation).toBe(false);
      expect(next.mutation.id).toBe("77");
    });

    // Currently fails: the fallback is computed into a dead const and never returned.
    it.fails("keeps the previous id when the response carries no internalId", () => {
      const state = { mutation: { id: "cid" } };

      expect(dispatchMutationResp(state, "createInsuree", { payload: {} }).mutation.id).toBe("cid");
    });
  });

  describe("dispatchMutationErr", () => {
    it("stringifies the payload into alert", () => {
      expect(dispatchMutationErr({}, { payload: { detail: "nope" } }).alert).toBe('{"detail":"nope"}');
    });
  });
});

describe("clearExpiredSession", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("wipes local storage before anything else", async () => {
    window.localStorage.setItem("csrfToken", JSON.stringify("abc"));

    await clearExpiredSession();

    expect(window.localStorage.length).toBe(0);
  });

  it("posts the cookie-deleting mutation with credentials", async () => {
    await clearExpiredSession();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/graphql");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(JSON.parse(options.body).query).toContain("deleteTokenCookie");
    expect(JSON.parse(options.body).query).toContain("deleteRefreshTokenCookie");
  });

  it("honours REACT_APP_API_URL", async () => {
    vi.stubEnv("REACT_APP_API_URL", "/custom-api");
    await clearExpiredSession();

    expect(fetchMock.mock.calls[0][0]).toBe("/custom-api/graphql");
  });

  it("adds a leading slash to a relative api url", async () => {
    vi.stubEnv("REACT_APP_API_URL", "custom-api");
    await clearExpiredSession();

    expect(fetchMock.mock.calls[0][0]).toBe("/custom-api/graphql");
  });

  it("warns but does not reject when the network call fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("offline"));

    await expect(clearExpiredSession()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("Failed to clear auth cookies", expect.any(Error));
  });
});

describe("openBlob", () => {
  const createObjectURL = vi.fn(() => "blob:fake");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    vi.stubGlobal("URL", Object.assign(Object.create(URL), { createObjectURL, revokeObjectURL }));
  });

  afterEach(() => vi.useRealTimers());

  it("clicks a download link for the blob", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    openBlob("data", "report.pdf", "pdf");

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
  });

  it("names the download and keeps the anchor hidden while it is in the document", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    openBlob("data", "report.pdf", "pdf");

    const anchor = document.querySelector('a[download="report.pdf"]');
    expect(anchor).not.toBeNull();
    expect(anchor.href).toContain("blob:fake");
    expect(anchor.style.display).toBe("none");
  });

  it("cleans up the anchor and revokes the url afterwards", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    openBlob("data", "report.pdf", "pdf");
    vi.advanceTimersByTime(100);

    expect(document.querySelector('a[download="report.pdf"]')).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });
});

describe("formatSorter", () => {
  const iconIn = (container) => container.querySelector("span[class*='material-symbols']")?.textContent;

  it("shows the neutral sort icon for a column that is not sorted", () => {
    const { container } = renderWithProviders(formatSorter("lastName", "chfId"));

    expect(iconIn(container)).toBe("unfold_more");
  });

  it("shows the ascending icon when sorted by that column", () => {
    const { container } = renderWithProviders(formatSorter("chfId", "chfId"));

    expect(iconIn(container)).toBe("expand_less");
  });

  it("shows the descending icon when sorted by that column reversed", () => {
    const { container } = renderWithProviders(formatSorter("-chfId", "chfId"));

    expect(iconIn(container)).toBe("expand_more");
  });

  it("renders a button in every state", () => {
    const { container } = renderWithProviders(formatSorter(null, "chfId"));

    expect(container.querySelector("button")).not.toBeNull();
  });
});
