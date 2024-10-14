import NepaliDate from "nepali-date-converter";
import { formatMessage } from "../helpers/i18n";
import { MODULE_NAME } from "../constants";

export function formatDateFromISO(date, intl, formattingOptions) {
  if (!date) return "";
  // this nepali-date-converter only supports dates up to this date, it will crash whole site if this date is exceeded
  // added as a safeguard, other solution is probably needed
  // TODO remove after nepal component change
  if (date > new Date("2090/12/30")) {
    date = new Date("2090/12/30");
  }

  try {
    return new NepaliDate(new Date(date)).format(...formattingOptions);
  } catch (error) {
    console.warn("[FORMAT DATE ERROR]: ", error);
    return formatMessage(intl, MODULE_NAME, "core.NeDateFormatter.dateOutOfRange");
  }
}
