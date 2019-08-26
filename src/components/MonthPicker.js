import React, { Component } from "react";
import { injectIntl } from "react-intl";
import SelectInput from "./SelectInput";
import { formatMessage } from "../helpers/i18n";
import _ from "lodash";

class MonthPicker extends Component {

    _onChange = v => this.props.onChange(
        v,
        formatMessage(this.props.intl, this.props.module, `${this.props.label}.${v}`)
    )

    render() {
        const { intl, name, value, withNull = true, module = "core", label = "month", nullLabel = "month.null" } = this.props;
        const options = withNull ? [{
            value: null,
            label: formatMessage(intl, module, `${nullLabel}`)
        }] : [];
        options.push(..._.range(1, 12).map(v => ({
            value: v,
            label: formatMessage(intl, module, `${label}.${v}`)
        })));
        return (
            <SelectInput
                module={module} label={label}
                options={options}
                name={name}
                value={value}
                onChange={this._onChange}
            />
        );
    }
}

export default injectIntl(MonthPicker);