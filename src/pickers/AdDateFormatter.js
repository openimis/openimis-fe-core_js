import moment from "moment";

export function formatDateFromISO(mm, intl, date) {
    if (!date) return '';
    return moment(date).format(mm.getConf("fe-core", "dateFormat", "YYYY-MM-DD"));
}