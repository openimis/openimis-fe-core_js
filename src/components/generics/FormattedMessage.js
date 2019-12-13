import React, { Component } from "react";
import { FormattedMessage as IntlFormattedMessage } from "react-intl";
import { injectIntl } from 'react-intl';

class FormattedMessage extends Component {

    render() {
        const { intl, module, id, values } = this.props;
        if (!!intl.messages[`${module}.${id}`]) {
            return <IntlFormattedMessage id={`${module}.${id}`} values={values}>
                {this.props.children}
            </IntlFormattedMessage>;
        } else {
            return <IntlFormattedMessage id={`${id}`} values={values}>
                {this.props.children}
            </IntlFormattedMessage>;
        }
    }
}

export default injectIntl(FormattedMessage);