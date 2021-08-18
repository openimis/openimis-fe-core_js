import moment from "moment";

export function formatDateFromISO(date) {
  if (!date) return "";
  let dte = moment(date);
  let bsDate = calendarFunctions.getBsDateByAdDate(dte.year(), dte.month() + 1, dte.date());
  return calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate);
}
