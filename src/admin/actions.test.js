import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchUsersSummaries } from "./actions";
import { makeStore, mockModulesManager } from "../testing";

// redux-api-middleware reads the status and, for a JSON content type, the body.
const graphqlAnswer = (body) => ({
  ok: true,
  status: 200,
  headers: new Headers({ "Content-Type": "application/json" }),
  json: async () => body,
  text: async () => JSON.stringify(body),
});

const noUsers = {
  data: {
    users: {
      totalCount: 0,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
      edges: [],
    },
  },
};

const sent = (fetchMock) => JSON.parse(fetchMock.mock.calls[0][1].body);

describe("fetchUsersSummaries", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(graphqlAnswer(noUsers));
    vi.stubGlobal("fetch", fetchMock);
  });

  // The Users searcher greys deleted users out from iUser.active (OP-3205).
  it("asks for the interactive user's deletion marker", async () => {
    await makeStore().dispatch(fetchUsersSummaries(mockModulesManager(), ["first: 10"]));

    expect(sent(fetchMock).query).toMatch(/iUser\{(?:[^{}]|\{[^{}]*\})*\bactive\b/);
  });
});
