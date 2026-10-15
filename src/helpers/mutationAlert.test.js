import { beforeEach, describe, expect, it, vi } from "vitest";

const store = {};
vi.mock("./useLocalStorage", () => ({
  getLocalStorage: (key, defaultValue = null) => (key in store ? store[key] : defaultValue),
  setLocalStorage: (key, value) => {
    store[key] = value;
  },
}));

import {
  buildMutationAlert,
  extractMutationResult,
  loadMutationResults,
  parseMutationError,
  storeMutationResult,
} from "./mutationAlert";

const formatMessage = (id) => `core.${id}`;

beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
});

describe("parseMutationError", () => {
  it("falls back to the default message when there is no error", () => {
    expect(parseMutationError(null, "nothing")).toEqual({ messages: ["nothing"], detail: null });
  });

  it("keeps a plain string as the message", () => {
    expect(parseMutationError("boom")).toEqual({ messages: ["boom"], detail: null });
  });

  it("splits messages from details in a JSON list", () => {
    expect(parseMutationError('[{"message": "a", "detail": "d1"}, {"message": "b"}]')).toEqual({
      messages: ["a", "b"],
      detail: "d1",
    });
  });

  it("serialises an entry that carries neither a message nor a detail", () => {
    expect(parseMutationError('[{"code": 7}]').messages).toEqual(['{"code":7}']);
  });
});

describe("extractMutationResult", () => {
  it("finds the mutation payload whatever the operation is called", () => {
    const result = extractMutationResult({
      createInsuree: { clientMutationId: "abc", internalId: "42", status: 2, metadata: { uuid: "u" } },
    });
    expect(result).toMatchObject({ clientMutationId: "abc", internalId: "42", status: 2 });
  });

  it("ignores a payload without a clientMutationId", () => {
    expect(extractMutationResult({ createInsuree: { internalId: "42" } })).toBeNull();
    expect(extractMutationResult(null)).toBeNull();
  });
});

describe("storeMutationResult", () => {
  it("round-trips a recorded result", () => {
    storeMutationResult({ clientMutationId: "abc", metadata: { uuid: "u" } });
    expect(loadMutationResults()).toEqual({ abc: { clientMutationId: "abc", metadata: { uuid: "u" } } });
  });

  it("keeps only the most recent results", () => {
    for (let i = 0; i < 105; i += 1) {
      storeMutationResult({ clientMutationId: `m${i}` });
    }
    const kept = Object.keys(loadMutationResults());
    expect(kept).toHaveLength(100);
    expect(kept).toContain("m104");
    expect(kept).not.toContain("m4");
  });

  it("ignores a result with no clientMutationId", () => {
    storeMutationResult({ metadata: {} });
    expect(loadMutationResults()).toEqual({});
  });
});

describe("buildMutationAlert", () => {
  const mutation = { clientMutationId: "abc", clientMutationLabel: "Save insuree", status: 2 };

  it("reports a success with the recorded metadata", () => {
    const alert = buildMutationAlert(mutation, { metadata: { uuid: "u" } }, formatMessage);
    expect(alert).toEqual({
      type: "success",
      title: "Save insuree",
      message: ["core.mutationSuccess"],
      detail: null,
      metadata: { uuid: "u" },
    });
  });

  it("reports an error with the messages parsed out of the log", () => {
    const failed = { ...mutation, status: 1, error: '[{"message": "duplicate", "detail": "chfId"}]' };
    const alert = buildMutationAlert(failed, undefined, formatMessage);
    expect(alert).toMatchObject({ type: "error", message: ["duplicate"], detail: "chfId" });
  });

  it("treats an unsuccessful recorded result as an error", () => {
    const alert = buildMutationAlert({ ...mutation, status: null }, { success: false }, formatMessage);
    expect(alert.type).toBe("error");
  });

  it("falls back to the journal entry when nothing was recorded", () => {
    const alert = buildMutationAlert(
      { ...mutation, clientMutationDetails: '["line one", "line two"]' },
      undefined,
      formatMessage,
    );
    expect(alert.detail).toBe("line one\nline two");
    expect(alert.metadata).toBeNull();
  });

  it("shows the claim stats of a batch mutation when there is no metadata", () => {
    const alert = buildMutationAlert(
      { ...mutation, jsonExt: JSON.stringify({ claim_stats: { header: "Batch", accepted: 3 } }) },
      undefined,
      formatMessage,
    );
    expect(alert.metadata).toEqual({ header: "Batch", accepted: 3 });
  });
});
