import moment from "moment";

export function formatMessage(intl, module, id, values) {
    if (!!intl.messages[`overwrite.${module}.${id}`]) {
        return intl.formatMessage({id: `overwrite.${module}.${id}`}, values);
    } else if (!!intl.messages[`${module}.${id}`]) {
        return intl.formatMessage({id: `${module}.${id}`}, values);
    } else {
        return intl.formatMessage({id: `${id}`}, values);
    }
};

export function formatAmount(intl, amount) {
    return `${intl.formatMessage({id: "currency"})} ${intl.formatNumber(amount)}`;
}

export function formatDateFromIso(intl, date) {
    return intl.formatDate(moment(date));
}

export function chip(intl, module, i, v) {
    return `${formatMessage(intl, module, i)} = ${v}`;
}