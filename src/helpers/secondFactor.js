// The wording every second-factor surface shares. Kept in one place because
// the throttle rule below has to hold on all of them, and did not while each
// page carried its own copy.

// The server omits the lifting time whenever the device does not report one,
// so the dated wording - which carries an {until} placeholder - cannot be the
// only branch, or that placeholder reaches the user verbatim.
export const throttledMessage = (
  { formatMessage, formatMessageWithValues, formatDateTimeFromISO },
  keys,
  lockedUntil,
) =>
  lockedUntil
    ? formatMessageWithValues(keys.dated, { until: formatDateTimeFromISO(lockedUntil) })
    : formatMessage(keys.undated);

const THROTTLED = "SECOND_FACTOR_THROTTLED";

const ERROR_KEYS = { dated: `error.${THROTTLED}`, undated: `error.${THROTTLED}_NO_TIME` };

// For the surfaces whose refusals are named `error.<CODE>` in their own
// namespace. `known` is the caller's own list: a code it cannot receive has no
// key, and formatMessage would print the bare id at the user.
export const refusalMessage = (translations, known, code, lockedUntil) => {
  if (code === THROTTLED) {
    return throttledMessage(translations, ERROR_KEYS, lockedUntil);
  }
  return known.includes(code) ? translations.formatMessage(`error.${code}`) : code;
};
