import React, { Component } from "react";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import { getDecimalPlaces } from "../../helpers/utils";
import { withModulesManager } from "@openimis/fe-core";
import FormattedNumberInput from "./FormattedNumberInput";

class NumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
    };
    this.thousandSeparator = props.modulesManager.getConf("fe-core", "thousandSeparator", "en");
  }

  getEffectiveNumberOfDecimals = () => {
    const { numberOfDecimals, allowDecimals = true } = this.props;
    return allowDecimals ? numberOfDecimals : 0;
  };

  handleKeyPress = (event) => {
    if (event.key === "." && this.getEffectiveNumberOfDecimals() === 0) {
      event.preventDefault();
    }
  };

  formatInput = (value, displayZero, displayNa) => {
    if (!value) {
      if (displayNa && !this.state.isEdited) {
        return formatMessage(this.props.intl, this.props.module, "core.NumberInput.notApplicable");
      }
      return displayZero && value === 0 ? "0" : "";
    }

    const strValue = String(value);

    // Preserve raw string while user is mid-entry (e.g., "1.")
    if (strValue.endsWith(".")) {
      return value;
    }

    const numericValue = Number(value);

    if (isNaN(numericValue)) return "";

    const effectiveDecimals = this.getEffectiveNumberOfDecimals();
    const decimals = effectiveDecimals !== undefined ? effectiveDecimals : getDecimalPlaces(numericValue);

    if (decimals > 0) {
      if (typeof value === "string" && strValue.includes(".") && strValue.split(".")[1].length > 0) {
        return parseFloat(value).toFixed(decimals);
      }
      return value;
    }

    return parseFloat(value);
  };

  handleNaBlur = () => {
    if ((isNaN(this.props.value) || this.props.value === "") && this.state.isEdited) {
      this.props.onChange(null);
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
      decimal,
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
      <>
        {!!this.thousandSeparator ? (
          <FormattedNumberInput
            {...this.props}
            thousandSeparator={this.thousandSeparator}
            numberOfDecimals={this.getEffectiveNumberOfDecimals()}
          />
        ) : (
          <TextInput
            {...others}
            module={module}
            value={value}
            error={err}
            inputProps={inputProps}
            formatInput={(v) => this.formatInput(v, displayZero, displayNa)}
            onFocus={() => this.setState({ isEdited: true })}
            onBlur={() => this.handleNaBlur()}
          />
        )}
      </>
    );
  }
}

export default withModulesManager(injectIntl(NumberInput));
