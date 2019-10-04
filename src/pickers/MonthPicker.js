import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import ConstantBasedPicker from "./ConstantBasedPicker";
import { formatMessage } from "../helpers/i18n";

class MonthPicker extends Component {

    render() {
        const { intl, module = "core", label = "month", ...others } = this.props;
        return <ConstantBasedPicker
            module={module}
            label={label}
            constants={_.range(1, 12)}
            {...others}
        />
    }
}

export default injectIntl(MonthPicker);