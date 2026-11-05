import { describe, expect, it } from "vitest";

import reducer from "./reducer";
import { globalId, relayPage } from "./testing/fixtures";

const initial = () => reducer(undefined, { type: "@@INIT" });
const on = (state, type, payload) => reducer(state, { type, payload });

describe("core reducer", () => {
  describe("initialisation", () => {
    it("builds a default state", () => {
      const state = initial();

      expect(state.user).toBeNull();
      expect(state.mutations).toEqual([]);
      expect(state.filtersCache).toEqual({});
      expect(state.isInitialized).toBe(false);
    });

    it("returns the same state object for an unknown action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("alerts", () => {
    it("stores an alert payload", () => {
      expect(on(initial(), "CORE_ALERT", { message: "boom" }).alert).toEqual({ message: "boom" });
    });

    it("removes the key entirely on clear, rather than nulling it", () => {
      const alerted = on(initial(), "CORE_ALERT", { message: "boom" });
      const cleared = on(alerted, "CORE_ALERT_CLEAR");

      expect(cleared).not.toHaveProperty("alert");
    });

    it("does not mutate the previous state", () => {
      const alerted = on(initial(), "CORE_ALERT", { message: "boom" });
      on(alerted, "CORE_ALERT_CLEAR");

      expect(alerted.alert).toEqual({ message: "boom" });
    });
  });

  describe("confirmations", () => {
    // The answer goes to the asker's onConfirm/onCancel, never into the store (OP-3229).
    it("opens the dialog without storing an answer", () => {
      const next = on(initial(), "CORE_CONFIRM", { title: "Delete?" });

      expect(next.confirm).toEqual({ title: "Delete?" });
      expect(next).not.toHaveProperty("confirmed");
    });

    it("drops the dialog on clear without storing the answer", () => {
      const asked = on(initial(), "CORE_CONFIRM", { title: "Delete?" });
      const answered = on(asked, "CORE_CONFIRM_CLEAR", true);

      expect(answered).not.toHaveProperty("confirmed");
      expect(answered).not.toHaveProperty("confirm");
    });
  });

  describe("filters cache", () => {
    it("merges entries instead of replacing the cache", () => {
      const first = on(initial(), "CORE_CACHE_FILTER", { insuree: { chfId: "1" } });
      const second = on(first, "CORE_CACHE_FILTER", { claim: { code: "C1" } });

      expect(second.filtersCache).toEqual({ insuree: { chfId: "1" }, claim: { code: "C1" } });
    });

    it("overwrites an existing entry for the same key", () => {
      const first = on(initial(), "CORE_CACHE_FILTER", { insuree: { chfId: "1" } });
      const second = on(first, "CORE_CACHE_FILTER", { insuree: { chfId: "2" } });

      expect(second.filtersCache.insuree).toEqual({ chfId: "2" });
    });

    it("removes only the named key on reset", () => {
      const cached = on(initial(), "CORE_CACHE_FILTER", { insuree: { chfId: "1" }, claim: { code: "C1" } });
      const reset = on(cached, "CORE_CACHE_FILTER_RESET", "insuree");

      expect(reset.filtersCache).toEqual({ claim: { code: "C1" } });
    });

    it("leaves the cache alone when resetting an unknown key", () => {
      const cached = on(initial(), "CORE_CACHE_FILTER", { insuree: { chfId: "1" } });

      expect(on(cached, "CORE_CACHE_FILTER_RESET", "nope").filtersCache).toEqual({ insuree: { chfId: "1" } });
    });

    it("does not mutate the previous cache", () => {
      const cached = on(initial(), "CORE_CACHE_FILTER", { insuree: { chfId: "1" } });
      on(cached, "CORE_CACHE_FILTER_RESET", "insuree");

      expect(cached.filtersCache).toEqual({ insuree: { chfId: "1" } });
    });
  });

  describe("request / response / error triads", () => {
    it("flags a fetch in flight", () => {
      const next = on(initial(), "CORE_ROLES_REQ");

      expect(next.fetchingRoles).toBe(true);
      expect(next.fetchedRoles).toBe(false);
    });

    it("parses relay edges and page info on success", () => {
      const inFlight = on(initial(), "CORE_ROLES_REQ");
      const next = reducer(inFlight, {
        type: "CORE_ROLES_RESP",
        payload: {
          data: {
            role: relayPage([
              { id: "1", name: "Admin" },
              { id: "2", name: "Clerk" },
            ]),
          },
        },
      });

      expect(next.fetchingRoles).toBe(false);
      expect(next.fetchedRoles).toBe(true);
      expect(next.roles).toEqual([
        { id: "1", name: "Admin" },
        { id: "2", name: "Clerk" },
      ]);
      expect(next.rolesTotalCount).toBe(2);
      expect(next.errorRoles).toBeNull();
    });

    it("records the error and stops the spinner on failure", () => {
      const inFlight = on(initial(), "CORE_ROLES_REQ");
      const next = reducer(inFlight, {
        type: "CORE_ROLES_ERR",
        payload: { status: 500, statusText: "Server Error" },
      });

      expect(next.fetchingRoles).toBe(false);
      expect(next.errorRoles).toMatchObject({ code: 500, message: "Server Error" });
    });
  });

  describe("responses that transform the payload", () => {
    it("decodes the relay id on each historical mutation", () => {
      const next = reducer(initial(), {
        type: "CORE_HISTORICAL_MUTATIONS_RESP",
        payload: {
          data: { mutationLogs: relayPage([{ id: globalId("MutationLogGQLType", 42), status: 0 }]) },
        },
      });

      expect(next.mutations).toEqual([{ id: "42", status: 0 }]);
      expect(next.fetchingHistoricalMutations).toBe(false);
    });

    it("unwraps the single role from an edge list", () => {
      const next = reducer(initial(), {
        type: "CORE_ROLE_RESP",
        payload: { data: { role: relayPage([{ id: "1", name: "Admin" }]) } },
      });

      expect(next.role).toEqual({ id: "1", name: "Admin" });
    });

    it("leaves the role undefined when the server returns no edges", () => {
      const next = reducer(initial(), {
        type: "CORE_ROLE_RESP",
        payload: { data: { role: relayPage([]) } },
      });

      expect(next.role).toBeUndefined();
    });
  });

  describe("impersonation", () => {
    it("clears the impersonated user when stopping", () => {
      const impersonating = { ...initial(), impersonatedUser: { id: 7 } };

      expect(on(impersonating, "CORE_STOP_IMPERSONATION").impersonatedUser).toBeNull();
    });
  });
});

describe("CORE_MUTATION_ADD idempotency", () => {
  // Journalling now happens centrally in fe-core, while the modules that have
  // not been migrated still call journalize() themselves. Both reach the same
  // reducer, so the add has to be idempotent or every such module would show
  // its mutations twice in the journal.
  const add = (state, payload) => on(state, "CORE_MUTATION_ADD", payload);

  it("keeps a single entry when central and per-module journalling both fire", () => {
    const central = { clientMutationId: "cmi-1", clientMutationLabel: "Delete service" };
    const perModule = { clientMutationId: "cmi-1", clientMutationLabel: "Delete service", id: "42" };

    const state = add(add(initial(), central), perModule);

    expect(state.mutations).toHaveLength(1);
    expect(state.mutations[0].clientMutationId).toBe("cmi-1");
  });

  it("is order independent", () => {
    const a = { clientMutationId: "cmi-2", id: "7" };
    const b = { clientMutationId: "cmi-2" };

    expect(add(add(initial(), a), b).mutations).toHaveLength(1);
    expect(add(add(initial(), b), a).mutations).toHaveLength(1);
  });

  it("returns the identical state object when the duplicate is dropped", () => {
    const first = add(initial(), { clientMutationId: "cmi-3" });
    const second = add(first, { clientMutationId: "cmi-3" });

    expect(second).toBe(first);
  });

  it("still adds distinct mutations", () => {
    const state = add(add(initial(), { clientMutationId: "a" }), { clientMutationId: "b" });

    expect(state.mutations).toHaveLength(2);
  });

  it("does not collapse entries that carry no clientMutationId", () => {
    const state = add(add(initial(), { status: 0 }), { status: 0 });

    expect(state.mutations).toHaveLength(2);
  });
});

describe("CORE_MUTATION_ADD status", () => {
  // A synchronous mutation is already finished when it is journalled, so the
  // status it arrives with has to survive rather than being reset to pending.
  it("keeps a terminal status supplied by the caller", () => {
    const state = on(initial(), "CORE_MUTATION_ADD", {
      clientMutationId: "sync-1",
      clientMutationLabel: "Change password",
      status: 2,
    });

    expect(state.mutations[0].status).toBe(2);
  });
});
