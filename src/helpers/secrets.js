// Client-side counterpart of openimis-be-core_py `core/mutation_log_secrets.py`.
// Kept deliberately identical in behaviour - same hints, same mask, same
// depth bound - so a field masked server-side is masked here too.

export const MASK = "********";

// Matched lowercased, by substring: `password`, `old_password`, `newPassword`
// and `user_password` are all covered by "password".
//
// Masking can only remove audit detail, never add any: when in doubt about a
// field name, better to include it. The list is deliberately broad.
export const SECRET_KEY_HINTS = [
  "password",
  "passwd",
  "passphrase",
  "secret",
  "token",
  "api_key",
  "apikey",
  "private_key",
  "privatekey",
  "credential",
  "otp",
];

// Maximum descent depth: a mutation payload is a shallow tree, and a bound
// keeps an unexpected structure from recursing without end.
const MAX_DEPTH = 20;

export function isSecretKey(key, extraKeys = []) {
  if (typeof key !== "string") return false;
  const lowered = key.toLowerCase();
  if (extraKeys.some((k) => typeof k === "string" && k.toLowerCase() === lowered)) return true;
  return SECRET_KEY_HINTS.some((hint) => lowered.includes(hint));
}

/**
 * Return a copy of `value` with the values under a sensitive key masked.
 *
 * The key itself is kept: the journal has to stay readable and show that a
 * password was indeed sent, without showing its value.
 *
 * `extraKeys` is the caller's own declaration, for a sensitive field whose
 * name matches none of the hints above.
 */
export function scrubSecrets(value, extraKeys = [], _depth = 0) {
  if (_depth > MAX_DEPTH) return value;
  if (Array.isArray(value)) {
    return value.map((item) => scrubSecrets(item, extraKeys, _depth + 1));
  }
  // Only plain structures are walked: a Date, a File or a class instance is
  // left as it is rather than being flattened into an object copy.
  if (value && typeof value === "object" && (value.constructor === Object || value.constructor === undefined)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        isSecretKey(key, extraKeys) ? MASK : scrubSecrets(inner, extraKeys, _depth + 1),
      ]),
    );
  }
  return value;
}

/** True if the structure carries at least one sensitive key, at any level. */
export function containsSecret(value, extraKeys = [], _depth = 0) {
  if (_depth > MAX_DEPTH) return false;
  if (Array.isArray(value)) {
    return value.some((item) => containsSecret(item, extraKeys, _depth + 1));
  }
  if (value && typeof value === "object" && (value.constructor === Object || value.constructor === undefined)) {
    return Object.entries(value).some(
      ([key, inner]) => isSecretKey(key, extraKeys) || containsSecret(inner, extraKeys, _depth + 1),
    );
  }
  return false;
}
