import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mutationErrorText, waitForMutation } from "./actions";

// dispatch receives the graphqlWithVariables thunk; it answers each poll with the next log.
function pollingDispatch(logs) {
  let call = 0;
  const dispatch = vi.fn(async () => {
    const node = logs[Math.min(call, logs.length - 1)];
    call += 1;
    return { payload: { data: { mutationLogs: { edges: node ? [{ node }] : [] } } } };
  });
  return dispatch;
}

describe("mutationErrorText", () => {
  it("reads a service error, a list of them and plain text", () => {
    expect(mutationErrorText({ success: false, message: "Failed to create Task", detail: "Task pending" }))
      .toBe("Failed to create Task: Task pending");
    expect(mutationErrorText([{ message: "A", detail: "x" }, { message: "B" }])).toBe("A: x; B");
    expect(mutationErrorText("module has no attribute X")).toBe("module has no attribute X");
    expect(mutationErrorText(null)).toBe("");
  });
});

describe("waitForMutation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns a JSON error parsed", async () => {
    const dispatch = pollingDispatch([{ status: 1, error: '{"message": "Failed", "detail": "why"}' }]);
    const result = await waitForMutation("cm-1")(dispatch);
    expect(result.error).toEqual({ message: "Failed", detail: "why" });
  });

  it("returns a plain-text error as stored instead of throwing", async () => {
    const dispatch = pollingDispatch([{ status: 1, error: "module 'x.schema' has no attribute 'Y'" }]);
    const result = await waitForMutation("cm-2")(dispatch);
    expect(result.error).toBe("module 'x.schema' has no attribute 'Y'");
  });

  it("polls until the log leaves RECEIVED", async () => {
    const dispatch = pollingDispatch([null, { status: 0 }, { status: 2 }]);
    const pending = waitForMutation("cm-3")(dispatch);
    await vi.runAllTimersAsync();
    expect((await pending).status).toBe(2);
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it("reports an unknown outcome when a poll fails", async () => {
    const httpError = vi.fn(async () => ({ error: true, payload: {} }));
    expect(await waitForMutation("cm-5")(httpError)).toBeNull();
    const graphqlError = vi.fn(async () => ({ payload: { errors: [{ message: "x" }], data: { mutationLogs: null } } }));
    expect(await waitForMutation("cm-6")(graphqlError)).toBeNull();
  });

  it("waits between polls while the log does not exist yet", async () => {
    const dispatch = pollingDispatch([null]);
    const pending = waitForMutation("cm-4")(dispatch);
    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(99);
    expect(dispatch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(dispatch).toHaveBeenCalledTimes(2);
    await vi.runAllTimersAsync();
    expect(await pending).toBeUndefined();
    expect(dispatch).toHaveBeenCalledTimes(11);
  });
});
