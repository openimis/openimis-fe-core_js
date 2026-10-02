// Tells an expired session apart from a permission refusal in GraphQL errors.
// Pure module (no imports) so it runs under `node --test`.

export const normalizeErrorMessage = (message) =>
  String(message || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .trim();

// `csrftoken` is the KeyError raised once the Django session holding the CSRF
// token has expired: the session is gone without any further check.
export const isSessionError = (gqlErrors = []) =>
  gqlErrors.some((error) => normalizeErrorMessage(error?.message) === "csrftoken");

// The backend raises "unauthorized" (translated per request locale) both for
// an anonymous request (JWT cookie gone) and for a missing right; "Signature
// has expired" comes from a JWT cookie past its expiry. The message cannot
// tell them apart, so the current-user endpoint decides whether the session
// is still valid.
const SESSION_CHECK_MESSAGES = new Set([
  "unauthorized",
  "user not authorized for this operation",
  "utilisateur non autorisé pour cette opération",
  "signature has expired",
  "la signature a expiré",
]);

export const needsSessionCheck = (gqlErrors = []) =>
  gqlErrors.some((error) => SESSION_CHECK_MESSAGES.has(normalizeErrorMessage(error?.message)));

// authMiddleware turns the probe's HTTP 401 into CORE_AUTH_ERR; any other
// failure (429, 5xx, network) leaves the session as it is.
export const isSessionLost = (probeAction) => probeAction?.type === "CORE_AUTH_ERR";

// Callers arriving while a run is pending share its promise, so a page whose
// queries all fail at once runs the wrapped function once.
export const shareInFlight = (run) => {
  let pending = null;
  return (...args) => {
    if (!pending) {
      pending = (async () => run(...args))().finally(() => {
        pending = null;
      });
    }
    return pending;
  };
};
