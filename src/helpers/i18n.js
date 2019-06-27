function formatMessage(intl, module, id, values) {
    if (!!intl.messages[`overwrite.${module}.${id}`]) {
        return intl.formatMessage({id: `overwrite.${module}.${id}`}, values);
    } else if (!!intl.messages[`${module}.${id}`]) {
        return intl.formatMessage({id: `${module}.${id}`}, values);
    } else {
        return intl.formatMessage({id: `${id}`}, values);
    }
};

export default formatMessage;

