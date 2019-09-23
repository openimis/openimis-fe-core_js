import { formatDateFromISO as adFormateDateFromISO } from "../pickers/AdDateFormatter";
import { formatDateFromISO as neFormateDateFromISO } from "../pickers/NeDateFormatter";

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
    return `${intl.formatMessage({ id: "currency" })} ${amount || 0}`;
}

export function formatDateFromISO(mm, intl, date) {
    if (mm.getConf("fe-core", "datePicker") === "ne") {
        return neFormateDateFromISO(date);
    }
    return adFormateDateFromISO(intl, date);
}

export function chip(intl, module, i, v) {
    return `${formatMessage(intl, module, i)} = ${v}`;
}