import React from "react";
import { Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import moment from "moment";
import { formatDateFromISO as adFormateDateFromISO } from "../pickers/AdDateFormatter";
import { formatDateFromISO as neFormateDateFromISO } from "../pickers/NeDateFormatter";
import { STORAGE_KEY_SECONDARY_CALENDAR, DEFAULT_SETTINGS} from "../constants";

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

export function formatAmount(intl, amount) {
  return `${intl.formatMessage({ id: "currency" })} ${amount || 0}`;
}

export function formatDateFromISO(mm, intl, date) {
  const isSecondaryCalendar = JSON.parse(localStorage.getItem(STORAGE_KEY_SECONDARY_CALENDAR));
  if (isSecondaryCalendar) {
    const secondCalendarFormatting = mm.getConf("fe-core", "secondCalendarFormatting", DEFAULT_SETTINGS.SECOND_CALENDAR_FORMAT);
    const secondCalendarFormattingLang = mm.getConf("fe-core", "secondCalendarFormattingLang", DEFAULT_SETTINGS.SECOND_CALENDAR_LANG);
    return neFormateDateFromISO(date, [secondCalendarFormatting, secondCalendarFormattingLang]);
  }
  return adFormateDateFromISO(mm, intl, date);
}

export function toISODate(d) {
  if (!d) return null;
  return moment(d).format().slice(0, 10);
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
    formatAmount: formatAmount.bind(null, intl),
    formatMessage: moduleName ? formatMessage.bind(null, intl, moduleName) : formatMessage.bind(null, intl),
    formatMessageWithValues: moduleName
      ? formatMessageWithValues.bind(null, intl, moduleName)
      : formatMessageWithValues.bind(null, intl),
  };
}
