/**
 * Turns what the backend reports about a mutation into the payload of a `coreAlert`.
 *
 * Two places need this and must stay consistent: the journal entries (classic sidebar or popup
 * drawer) and the completion snackbar, both of which offer an "(i)" button opening the very same
 * dialog.
 */

import { getLocalStorage, setLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "mutationResults";
/** journal pages are small, and this only has to outlive a reload */
const MAX_RECORDED_RESULTS = 100;

/**
 * Mutation payloads recorded so far, keyed by clientMutationId. Kept in localStorage because the
 * mutation log queried by the journal does not carry the metadata, so a reload would otherwise
 * leave the "(i)" of every past mutation empty. Cleared with the rest of the storage on logout.
 */
export function loadMutationResults() {
  const stored = getLocalStorage(STORAGE_KEY);
  return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
}

export function storeMutationResult(result) {
  if (!result?.clientMutationId) return;
  const results = loadMutationResults();
  delete results[result.clientMutationId]; // re-insert last so trimming drops the oldest
  results[result.clientMutationId] = result;
  const ids = Object.keys(results);
  const kept = ids.length > MAX_RECORDED_RESULTS ? ids.slice(ids.length - MAX_RECORDED_RESULTS) : ids;
  setLocalStorage(STORAGE_KEY, Object.fromEntries(kept.map((id) => [id, results[id]])));
}

/**
 * `error` is free-form: a plain string, a JSON string, an object or a list of `{message, detail}`.
 */
export function parseMutationError(error, defaultMsg = "Operation failed.") {
  if (!error) return { messages: [defaultMsg], detail: null };

  let parsed = error;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      return { messages: [error], detail: null };
    }
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      // a string that is not JSON is the message itself
    }
  }

  const messages = [];
  const details = [];

  const collect = (item) => {
    if (item && typeof item === "object") {
      if (item.message) messages.push(item.message);
      if (item.detail) details.push(item.detail);
      if (!item.message && !item.detail) messages.push(JSON.stringify(item));
    } else if (item) {
      messages.push(String(item));
    }
  };

  if (Array.isArray(parsed)) {
    parsed.forEach(collect);
  } else {
    collect(parsed);
  }

  return {
    messages: messages.length ? messages : [defaultMsg],
    detail: details.length ? details.join("\n") : null,
  };
}

/**
 * The mutation payload carried by a GraphQL response, whatever the mutation is called.
 */
export function extractMutationResult(data) {
  if (!data || typeof data !== "object") return null;
  const key = Object.keys(data).find((k) => {
    const value = data[k];
    return value && typeof value === "object" && ("clientMutationId" in value || "internalId" in value);
  });
  const result = key ? data[key] : null;
  if (!result?.clientMutationId) return null;
  return {
    clientMutationId: result.clientMutationId,
    internalId: result.internalId ?? null,
    status: result.status ?? null,
    success: result.success ?? null,
    error: result.error ?? null,
    message: result.message ?? null,
    metadata: result.metadata ?? null,
  };
}

const mutationDetails = (mutation) => {
  if (!mutation?.clientMutationDetails) return null;
  try {
    const details = JSON.parse(mutation.clientMutationDetails);
    return Array.isArray(details) ? details.join("\n") : String(details);
  } catch (e) {
    return String(mutation.clientMutationDetails);
  }
};

/** batch mutations report their outcome as claim stats on the log itself */
const claimStats = (mutation) => {
  if (!mutation?.jsonExt) return null;
  try {
    return JSON.parse(mutation.jsonExt)?.claim_stats ?? null;
  } catch (e) {
    return null;
  }
};

/**
 * @param mutation the journal entry (mutation log), holding the label and the polled status
 * @param result   the mutation response recorded at submission time, holding the metadata
 * @param formatMessage bound on the "core" module
 */
export function buildMutationAlert(mutation, result, formatMessage) {
  const isError = mutation?.status === 1 || result?.success === false;
  const rawError = mutation?.error ?? result?.error ?? null;
  const { messages, detail } = isError
    ? parseMutationError(rawError, formatMessage("mutationError"))
    : { messages: [result?.message || formatMessage("mutationSuccess")], detail: null };

  return {
    type: isError ? "error" : "success",
    title: mutation?.clientMutationLabel || formatMessage(isError ? "error" : "success"),
    message: messages,
    detail: detail ?? mutationDetails(mutation),
    metadata: result?.metadata ?? claimStats(mutation),
  };
}
