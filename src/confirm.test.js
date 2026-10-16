import { describe, expect, it, vi } from "vitest";
import { applyMiddleware, createStore } from "redux";

import { coreConfirm, clearConfirm } from "./actions";
import reducer from "./reducer";

/** redux-thunk is an assembly dependency; the two lines it contributes are cheaper to inline. */
const thunk =
  ({ dispatch, getState }) =>
  (next) =>
  (action) =>
    typeof action === "function" ? action(dispatch, getState) : next(action);

const setup = () => createStore((state, action) => ({ core: reducer(state?.core, action) }), applyMiddleware(thunk));

describe("coreConfirm", () => {
  it("gives the answer to the asker, and only to the asker", () => {
    const store = setup();
    const mine = vi.fn();

    store.dispatch(coreConfirm("t", "m", { onConfirm: mine }));
    expect(mine).not.toHaveBeenCalled();

    store.dispatch(clearConfirm(true));
    expect(mine).toHaveBeenCalledTimes(1);
  });

  it("does not run the action when the user declines", () => {
    const store = setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    store.dispatch(coreConfirm("t", "m", { onConfirm, onCancel }));
    store.dispatch(clearConfirm(false));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("forgets a declined action, so the next confirmation cannot run it (OP-3190)", () => {
    const store = setup();
    const declined = vi.fn();
    const accepted = vi.fn();

    // the user opens one dialog and cancels it
    store.dispatch(coreConfirm("delete policy", "m", { onConfirm: declined }));
    store.dispatch(clearConfirm(false));

    // then answers a different one with OK
    store.dispatch(coreConfirm("delete insuree", "m", { onConfirm: accepted }));
    store.dispatch(clearConfirm(true));

    expect(accepted).toHaveBeenCalledTimes(1);
    expect(declined).not.toHaveBeenCalled();
  });

  it("answers only the most recent asker when a second dialog replaces the first", () => {
    const store = setup();
    const first = vi.fn();
    const second = vi.fn();

    store.dispatch(coreConfirm("a", "m", { onConfirm: first }));
    store.dispatch(coreConfirm("b", "m", { onConfirm: second }));
    store.dispatch(clearConfirm(true));

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("still accepts the legacy intent string as the third argument", () => {
    const store = setup();
    store.dispatch(coreConfirm("Session Expired", "m", "csrf_logout"));
    expect(store.getState().core.confirm).toMatchObject({ intent: "csrf_logout" });
    expect(() => store.dispatch(clearConfirm(true))).not.toThrow();
  });
});
