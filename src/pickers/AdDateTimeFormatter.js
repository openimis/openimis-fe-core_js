import moment from "moment";

export function formatDateTimeFromISO(mm, intl, date) {
  if (!date) return "";

  let momentDate = moment(date);

  if (momentDate.isValid()) {
    return momentDate.format(mm.getConf("fe-core", "dateTimeFormat", "YYYY-MM-DD HH:mm:ss"));
  } else {
    return moment(date).format(mm.getConf("fe-core", "dateTimeFormat", "YYYY-MM-DD HH:mm:ss"));
  }
}
