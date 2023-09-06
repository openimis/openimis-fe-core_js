import NepaliDate from "nepali-date-converter";

export function formatDateFromISO(date, formattingOptions) {
  if (!date) return "";
  // this nepali-date-converter only supports dates up to this date, it will crash whole site if this date is exceeded
  // added as a safeguard, other solution is probably needed
  // TODO remove after nepal component change
  if (date > new Date("2090/12/30")) {
    date = new Date("2090/12/30");
  }
  let bsDate = new NepaliDate(new Date(date)).format(...formattingOptions);
  return bsDate;
}
