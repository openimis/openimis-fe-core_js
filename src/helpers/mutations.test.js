import { describe, expect, it } from "vitest";

import { immediateMutationOutcome } from "../actions";
import { MUTATION_ERROR, MUTATION_SUCCESS } from "./mutations";

describe("immediateMutationOutcome", () => {
  // A mutation that runs inline reports its own result, so it can be journalled
  // as finished instead of being added as pending and polled - which it never
  // could be, having no MutationLog.
  const resp = (data) => ({ payload: { data } });

  it("reads a successful synchronous mutation", () => {
    const outcome = immediateMutationOutcome(resp({ changePassword: { success: true, error: null } }));

    expect(outcome).toEqual({ status: MUTATION_SUCCESS, error: null });
  });

  it("reads a failed synchronous mutation and keeps its error", () => {
    const outcome = immediateMutationOutcome(
      resp({ changePassword: { success: false, error: "Failed to change user password" } }),
    );

    expect(outcome).toEqual({ status: MUTATION_ERROR, error: "Failed to change user password" });
  });

  it("returns undefined for an asynchronous mutation, which must still be polled", () => {
    expect(immediateMutationOutcome(resp({ createContributionPlan: { clientMutationId: "x", internalId: "7" } }))).toBeUndefined();
  });

  it("tolerates an empty or malformed response", () => {
    expect(immediateMutationOutcome(undefined)).toBeUndefined();
    expect(immediateMutationOutcome({})).toBeUndefined();
    expect(immediateMutationOutcome(resp(null))).toBeUndefined();
    expect(immediateMutationOutcome(resp({ thing: null }))).toBeUndefined();
  });

  it("ignores a non-boolean success field", () => {
    expect(immediateMutationOutcome(resp({ thing: { success: "yes" } }))).toBeUndefined();
  });
});

// Guards the rule the JournalDrawer applies when deciding what to announce.
// A synchronous mutation is journalled with its final status and never passes
// through 0, so a transition-only test would silently skip it - which is what
// made the password change produce a journal entry but no notice.
const announces = (previous, current) => {
  const previousById = new Map((previous || []).map((m) => [m.clientMutationId, m]));
  return (current || []).filter((m) => {
    if (m.status === 0) return false;
    const before = previousById.get(m.clientMutationId);
    return !before || before.status === 0;
  });
};

describe("which mutations the journal announces", () => {
  it("announces one that just settled", () => {
    const got = announces([{ clientMutationId: "a", status: 0 }], [{ clientMutationId: "a", status: 2 }]);

    expect(got).toHaveLength(1);
  });

  it("announces one that arrived already settled", () => {
    const got = announces([], [{ clientMutationId: "sync", status: 2 }]);

    expect(got).toHaveLength(1);
  });

  it("stays quiet for one still pending", () => {
    expect(announces([], [{ clientMutationId: "a", status: 0 }])).toHaveLength(0);
  });

  it("does not announce the same mutation twice", () => {
    const settled = [{ clientMutationId: "a", status: 2 }];

    expect(announces(settled, settled)).toHaveLength(0);
  });
});
