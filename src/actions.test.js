import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "./actions";
import { makeStore } from "./testing";

// redux-api-middleware reads the status and, for a JSON content type, the body.
const graphqlAnswer = (body) => ({
  ok: true,
  status: 200,
  headers: new Headers({ "Content-Type": "application/json" }),
  json: async () => body,
  text: async () => JSON.stringify(body),
});

const refusal = (code, extensions = {}) => ({
  data: { tokenAuth: null },
  errors: [{ message: code, extensions: { code, ...extensions } }],
});

const sent = (fetchMock) => JSON.parse(fetchMock.mock.calls[0][1].body);

describe("login", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends the mutation it always has when no code is given", async () => {
    fetchMock.mockResolvedValue(graphqlAnswer(refusal("SECOND_FACTOR_REQUIRED")));

    await makeStore().dispatch(login({ username: "alice", password: "password" }));

    const { query, variables } = sent(fetchMock);
    expect(query).not.toContain("otp");
    expect(variables).toEqual({ username: "alice", password: "password" });
  });

  it("declares and sends otp when a code is given", async () => {
    fetchMock.mockResolvedValue(graphqlAnswer(refusal("INVALID_SECOND_FACTOR")));

    await makeStore().dispatch(login({ username: "alice", password: "password", otp: "123456" }));

    const { query, variables } = sent(fetchMock);
    expect(query).toContain("$otp: String");
    expect(query).toContain("otp: $otp");
    expect(variables.otp).toBe("123456");
  });

  it("returns the refusal's extensions alongside its code", async () => {
    fetchMock.mockResolvedValue(
      graphqlAnswer(refusal("SECOND_FACTOR_THROTTLED", { lockedUntil: "2026-09-17T10:00:00+00:00" })),
    );

    const result = await makeStore().dispatch(login({ username: "alice", password: "password", otp: "000000" }));

    expect(result).toEqual({
      loginStatus: "CORE_AUTH_ERR",
      message: "SECOND_FACTOR_THROTTLED",
      extensions: { code: "SECOND_FACTOR_THROTTLED", lockedUntil: "2026-09-17T10:00:00+00:00" },
    });
  });
});
