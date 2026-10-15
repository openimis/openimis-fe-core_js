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
