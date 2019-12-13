import React, { Component } from "react";
import TextInput from "./TextInput";
import { injectIntl } from 'react-intl';
import { formatMessageWithValues } from "../../helpers/i18n";

class NumberInput extends Component {
    formatInput = (v) => {
        if (!v && v !== 0) {
            return "";
        }
        return v;
    }
    render() {
        const { intl, module = "core", min = null, max = null, value, error } = this.props;
        let inputProps = { ...this.props.inputProps }
        inputProps.type = "number";
        let err = error;

        if (min !== null) {
            inputProps.min = min;
            if (value < min) err = formatMessageWithValues(
                intl, module, "validation.minValue",
                {
                    value,
                    min
                })
        }
        if (max !== null) {
            inputProps.max = max;
            if (value > max) err = formatMessageWithValues(
                intl, module, "validation.maxValue",
                {
                    value,
                    max
                })
        }
        
        return (
            <TextInput {...this.props}
                error={err}
                inputProps={inputProps}
                formatInput={this.formatInput}
            />
        )
    }
}

export default injectIntl(NumberInput);