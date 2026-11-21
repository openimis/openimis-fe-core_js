import React from "react";
import { Tooltip } from "@mui/material";
import { useIntl } from "react-intl";
import moment from "moment";
import { formatDateFromISO as adFormateDateFromISO } from "../pickers/AdDateFormatter";
import { formatDateTimeFromISO as adFormateDateTimeFromISO } from "../pickers/AdDateTimeFormatter";
import { formatDateFromISO as neFormateDateFromISO } from "../pickers/NeDateFormatter";
import { STORAGE_KEY_SECONDARY_CALENDAR, DEFAULT_SETTINGS } from "../constants";
import { getLocalStorage } from "./useLocalStorage";

// React's own statics, which a wrapper must not copy from the wrapped component.
const REACT_STATICS = new Set([
  "length",
  "name",
  "prototype",
  "caller",
  "callee",
  "arguments",
  "arity",
  "displayName",
  "propTypes",
  "defaultProps",
  "contextType",
  "contextTypes",
  "childContextTypes",
  "getDefaultProps",
  "getDerivedStateFromProps",
  "getDerivedStateFromError",
  "$$typeof",
  "render",
  "compare",
  "type",
]);

/**
 * react-intl 5-7's injectIntl, removed in react-intl 10: gives the wrapped
 * component the `intl` object as a prop. New code should call useIntl() instead.
 */
export function injectIntl(Component) {
  const WithIntl = (props) => <Component {...props} intl={useIntl()} />;
  for (const key of Object.getOwnPropertyNames(Component)) {
    if (!REACT_STATICS.has(key)) {
      Object.defineProperty(WithIntl, key, Object.getOwnPropertyDescriptor(Component, key));
    }
  }
  WithIntl.displayName = `injectIntl(${Component.displayName || Component.name || "Component"})`;
  WithIntl.WrappedComponent = Component;
  return WithIntl;
}

//formatting with values is expansive.. so let's have separated methods
export function formatMessage(intl, module, id) {
  if (!!intl.messages[`${module}.${id}`]) {
    return intl.formatMessage({ id: `${module}.${id}` });
  } else {
    return intl.formatMessage({ id: `${id}` });
  }
}

export function formatMessageWithValues(intl, module, id, values) {
  if (!!intl.messages[`${module}.${id}`]) {
    return intl.formatMessage({ id: `${module}.${id}` }, values);
  } else {
    return intl.formatMessage({ id: `${id}` }, values);
  }
}

export function formatAmount(mm, intl, amount) {
  const thousandSeparator = mm.getConf("fe-core", "thousandSeparator", "fr");
  const number = amount || 0;
  const numberOfDecimals = mm.getConf("fe-core", "numberOfDecimals", 2);
  if (!!thousandSeparator) {
    const formattedAmount = new Intl.NumberFormat(thousandSeparator, {
      minimumFractionDigits: numberOfDecimals,
      maximumFractionDigits: numberOfDecimals,
    }).format(number);
    return `${intl.formatMessage({ id: "currency" })} ${formattedAmount}`;
  }

  const formattedAmount = Number(amount).toFixed(numberOfDecimals);
  return `${intl.formatMessage({ id: "currency" })} ${formattedAmount}`;
}

export function formatDateFromISO(mm, intl, date) {
  const isSecondaryCalendar = getLocalStorage(STORAGE_KEY_SECONDARY_CALENDAR, false);
  if (isSecondaryCalendar) {
    const secondCalendarFormatting = mm.getConf(
      "fe-core",
      "secondCalendarFormatting",
      DEFAULT_SETTINGS.SECOND_CALENDAR_FORMAT,
    );
    const secondCalendarFormattingLang = mm.getConf(
      "fe-core",
      "secondCalendarFormattingLang",
      DEFAULT_SETTINGS.SECOND_CALENDAR_LANG,
    );
    return neFormateDateFromISO(date, intl, [secondCalendarFormatting, secondCalendarFormattingLang]);
  }
  return adFormateDateFromISO(mm, intl, date);
}

export function formatDateTimeFromISO(mm, intl, date) {
  return adFormateDateTimeFromISO(mm, intl, date);
}

export function toISODate(d) {
  if (!d) return null;
  return moment(d).format().slice(0, 10);
}

export function toISODateTime(d) {
  if (!d) return null;
  return moment(d).toISOString().slice(0, 19);
}

export function withTooltip(c, t, placement = "bottom") {
  return !!t ? (
    <Tooltip title={t} placement={placement}>
      {c}
    </Tooltip>
  ) : (
    c
  );
}

export function useTranslations(moduleName, modulesManager) {
  // TODO: Take modulesManager from the context (once it has been refactored in @openimis/fe)
  const intl = useIntl();

  return {
    formatDateFromISO: formatDateFromISO.bind(null, modulesManager, intl),
    formatDateTimeFromISO: formatDateTimeFromISO.bind(null, modulesManager, intl),
    formatAmount: formatAmount.bind(null, modulesManager, intl),
    formatMessage: moduleName ? formatMessage.bind(null, intl, moduleName) : formatMessage.bind(null, intl),
    formatMessageWithValues: moduleName
      ? formatMessageWithValues.bind(null, intl, moduleName)
      : formatMessageWithValues.bind(null, intl),
  };
}
