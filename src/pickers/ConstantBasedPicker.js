import React, { Component } from "react";
import { injectIntl } from "react-intl";
import SelectInput from "../components/SelectInput";
import { formatMessage } from "../helpers/i18n";


class ConstantBasedPicker extends Component {

    _formatValue = v => v === null ?
        formatMessage(
            this.props.intl,
            this.props.module,
            this.props.nullLabel ? this.props.nullLabel : `${this.props.label}.null`
        ) :
        formatMessage(
            this.props.intl,
            this.props.module,
            `${this.props.label}.${v}`
        )

    _onChange = v => this.props.onChange(
        v,
        this._formatValue(v)
    )

    render() {
        const { module, label, constants, name, value, withNull = true, readOnly = false } = this.props;
        const options = withNull ? [{
            value: null,
            label: this._formatValue(null)
        }] : [];
        options.push(...constants.map(v => ({
            value: v,
            label: this._formatValue(v)
        })));
        return (
            <SelectInput
                module={module}
                label={label}
                options={options}
                name={name}
                value={value}
                onChange={this._onChange}
                readOnly={readOnly}
            />
        );
    }
}

export default injectIntl(ConstantBasedPicker);