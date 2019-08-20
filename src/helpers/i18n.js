import moment from "moment";

//formatting with values is expansive.. so let's have separated methids
export function formatMessage(intl, module, id) {
    if (!!intl.messages[`overwrite.${module}.${id}`]) {
        return intl.formatMessage({ id: `overwrite.${module}.${id}` });
    } else if (!!intl.messages[`${module}.${id}`]) {
        return intl.formatMessage({ id: `${module}.${id}` });
    } else {
        return intl.formatMessage({ id: `${id}` });
    }
};

export function formatMessageWithValues(intl, module, id, values) {
    if (!!intl.messages[`overwrite.${module}.${id}`]) {
        return intl.formatMessage({ id: `overwrite.${module}.${id}` }, values);
    } else if (!!intl.messages[`${module}.${id}`]) {
        return intl.formatMessage({ id: `${module}.${id}` }, values);
    } else {
        return intl.formatMessage({ id: `${id}` }, values);
    }
};


export function formatAmount(intl, amount) {
    return `${intl.formatMessage({ id: "currency" })} ${intl.formatNumber(amount)}`;
}

export function formatDateFromIso(intl, date) {
    return intl.formatDate(moment(date));
}

export function chip(intl, module, i, v) {
    return `${formatMessage(intl, module, i)} = ${v}`;
}

export function fromISODate(s) {
    if (!s) return null;
    return moment(s).toDate();
}

export function toISODate(d) {
    if (!d) return null;
    return d.toISOString().substring(0, 10);
}