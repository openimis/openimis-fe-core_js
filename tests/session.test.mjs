import test from "node:test";
import assert from "node:assert/strict";

import { isSessionError, needsSessionCheck, isSessionLost, shareInFlight } from "../src/helpers/session.js";

test("an expired Django session (csrftoken) is a session error", () => {
  assert.equal(isSessionError([{ message: "'csrftoken'" }]), true);
});

test("permission refusals of a valid session are not session errors", () => {
  assert.equal(isSessionError([{ message: "Unauthorized" }]), false);
  assert.equal(isSessionError([{ message: "User not authorized for this operation" }]), false);
});

test("no errors, no session error", () => {
  assert.equal(isSessionError([]), false);
  assert.equal(isSessionError(), false);
});

test("an authorization refusal needs a session check: anonymous and missing right share the message", () => {
  assert.equal(needsSessionCheck([{ message: "unauthorized" }]), true);
  assert.equal(needsSessionCheck([{ message: "Unauthorized" }]), true);
  assert.equal(needsSessionCheck([{ message: "User not authorized for this operation" }]), true);
  assert.equal(needsSessionCheck([{ message: "Utilisateur non autorisé pour cette opération" }]), true);
  assert.equal(needsSessionCheck([{ message: "Signature has expired" }]), true);
  assert.equal(needsSessionCheck([{ message: "La signature a expiré" }]), true);
  assert.equal(needsSessionCheck([{ message: "other" }, { message: "unauthorized" }]), true);
});

test("csrftoken, unrelated errors and no errors need no session check", () => {
  assert.equal(needsSessionCheck([{ message: "'csrftoken'" }]), false);
  assert.equal(needsSessionCheck([{ message: "Location not found" }]), false);
  assert.equal(needsSessionCheck([]), false);
  assert.equal(needsSessionCheck(), false);
});

test("the session is lost only when the current-user probe ends in CORE_AUTH_ERR", () => {
  assert.equal(isSessionLost({ type: "CORE_AUTH_ERR", payload: { name: "ApiError", status: 401 } }), true);
  assert.equal(isSessionLost({ type: "CORE_SESSION_CHECK_RESP", payload: { id: 1 } }), false);
  assert.equal(isSessionLost({ type: "CORE_SESSION_CHECK_ERR", error: true, payload: { status: 500 } }), false);
  assert.equal(isSessionLost(undefined), false);
});

test("concurrent refusals run one probe; a later refusal runs a new one", async () => {
  let calls = 0;
  let release;
  const check = shareInFlight(() => {
    calls += 1;
    return new Promise((resolve) => {
      release = resolve;
    });
  });

  const first = check();
  const second = check();
  const third = check();
  assert.equal(calls, 1);
  assert.equal(first, second);
  assert.equal(second, third);

  release("done");
  assert.equal(await first, "done");

  const later = check();
  assert.equal(calls, 2);
  release("again");
  assert.equal(await later, "again");
});

test("a failed probe does not block the next one", async () => {
  let calls = 0;
  const check = shareInFlight(async () => {
    calls += 1;
    throw new Error("network");
  });

  await assert.rejects(check(), /network/);
  await assert.rejects(check(), /network/);
  assert.equal(calls, 2);
});
