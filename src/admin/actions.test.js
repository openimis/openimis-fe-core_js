import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchUser } from "./actions";
import { globalId, makeStore, mockModulesManager } from "../testing";

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
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
      edges: [],
    },
  },
};

const sent = (fetchMock) => JSON.parse(fetchMock.mock.calls[0][1].body);

const withFlag = (secondFactor) =>
  mockModulesManager({
    getConf: (module, key, defaultValue) => (key === "App.secondFactor" ? secondFactor : defaultValue),
  });

const USER_ID = globalId("UserGQLType", "3f2b6a3e-0c9d-4b7e-9c1a-1d2e3f4a5b6c");

describe("fetchUser", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(graphqlAnswer(noUsers));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("asks for the second-factor status while the feature is on", async () => {
    await makeStore().dispatch(fetchUser(withFlag(true), USER_ID));

    expect(sent(fetchMock).query).toContain("hasSecondFactor");
  });

  it("sends the query it always has while the feature is off", async () => {
    await makeStore().dispatch(fetchUser(withFlag(false), USER_ID));

    expect(sent(fetchMock).query).not.toContain("hasSecondFactor");
  });
});
