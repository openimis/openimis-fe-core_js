import React, { Component } from "react";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import {formatMessage, formatMessageWithValues} from "../../helpers/i18n";

class NumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
    };
  }
  formatInput = (v, displayZero, displayNa, value) => {
    if (!v && displayNa && !this.state.isEdited) return formatMessage(this.props.intl, this.props.module, "core.NumberInput.notApplicable");
    if (v === 0 && displayZero) return '0';
    if (v == 0 && !displayZero) return '';
    if (!v || isNaN(v)) return "";
    return parseFloat(v);
  };

  handleNaBlur = () => {
    if ((isNaN(this.props.value) || this.props.value === '') && this.state.isEdited) {
      this.props.onChange(undefined);
    }
    this.setState({ isEdited: false });
  };
  render() {
    const { intl, module = "core", min = null, max = null, value, error, displayZero = false, displayNa = false, ...others } = this.props;
    let inputProps = { ...this.props.inputProps, type: "tel" }; // We use "tel" instead of "number" to hide up/down arrows
    let err = error;

    if (min !== null) {
      inputProps.min = min;
      if (value < min)
        err = formatMessageWithValues(intl, module, "validation.minValue", {
          value,
          min,
        });
    }
    if (max !== null) {
      inputProps.max = max;
      if (value > max)
        err = formatMessageWithValues(intl, module, "validation.maxValue", {
          value,
          max,
        });
    }

    return (
      <TextInput
        {...others}
        module={module}
        value={value}
        error={err}
        inputProps={inputProps}
        formatInput={(v) =>this.formatInput(v, displayZero, displayNa, value)}
        onFocus={() => this.setState({isEdited: true})}
        onBlur={() => this.handleNaBlur()}
      />
    );
  }
}

export default injectIntl(NumberInput);
