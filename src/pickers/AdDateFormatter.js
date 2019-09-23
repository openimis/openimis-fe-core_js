import moment from "moment";

export function formatDateFromISO(intl, date) {
    if (!date) return '';
    return intl.formatDate(moment(date));
}