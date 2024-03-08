import React, { Component } from "react";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";

class NumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
    };
  }

  handleKeyPress = (event) => {
    const { allowDecimals = true } = this.props;

    if (event.key === "." && !allowDecimals) {
      event.preventDefault();
    }
  };

  formatInput = (value, displayZero, displayNa, decimal) => {
    if (!value) {
      if (displayNa && !this.state.isEdited) {
        return formatMessage(this.props.intl, this.props.module, "core.NumberInput.notApplicable");
      }
      return displayZero && value === 0 ? "0" : "";
    }

    const numericValue = Number(value);

    if (isNaN(numericValue)) return "";

    if (decimal) {
      if (typeof value === "string" && value.includes(".") && value.split(".")[1].length > 2) {
        return parseFloat(value).toFixed(2);
      }
      return value;
    }

    return parseFloat(value);
  };

  handleNaBlur = () => {
    if ((isNaN(this.props.value) || this.props.value === "") && this.state.isEdited) {
      this.props.onChange(undefined);
    }
    this.setState({ isEdited: false });
  };

  render() {
    const {
      intl,
      module = "core",
      min = null,
      max = null,
      value,
      error,
      displayZero = false,
      displayNa = false,
      allowDecimals = true,
      ...others
    } = this.props;
    let inputProps = { ...this.props.inputProps, type: "number", onKeyPress: this.handleKeyPress };
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
        formatInput={(v) => this.formatInput(v, displayZero, displayNa, allowDecimals)}
        onFocus={() => this.setState({ isEdited: true })}
        onBlur={() => this.handleNaBlur()}
      />
    );
  }
}

export default injectIntl(NumberInput);
