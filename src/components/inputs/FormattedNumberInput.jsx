import React, { Component } from "react";
import { styled } from "@mui/material/styles";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import withModulesManager from "../../helpers/modules";
import { getDecimalPlaces, parseLocalizedNumber } from "../../helpers/utils";

const StyledFormattedNumberInput = styled("div")(({ theme }) => ({}));

class FormattedNumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
      rawValue: props.value != null ? this.formatNumber(props.value) : "",
    };
  }

  componentDidUpdate(prevProps) {
    const { value, intl } = this.props;
    const { isEdited, rawValue } = this.state;
    const valueChanged = !Object.is(prevProps.value, value);
    const hasValue = value !== null && value !== undefined;
    
    if (valueChanged && isEdited === false) {
      const formattedValue = hasValue
        ? this.formatNumber(value, intl)
        : "";
      if (formattedValue !== rawValue) {
        this.setState({ rawValue: formattedValue });
      }
    }
  }

  normalizeNumberInput = (raw) => {
    if (!raw) return "";
    let normalized = raw.replace(/\s/g, "");
    const hasComma = normalized.includes(",");
    const hasDot = normalized.includes(".");
    
    if (hasComma && hasDot) {
      normalized = normalized.replace(/,/g, "");
    } else if (hasComma && !hasDot) {
      const parts = normalized.split(",");
      if (parts[1]?.length === 3) {
        normalized = normalized.replace(/,/g, "");
      } else {
        normalized = normalized.replace(",", ".");
      }
    }
    return normalized;
  };

  formatNumber = (value, intl) => {
    if (value == null || isNaN(value)) return "";

    let decimals = this.props.numberOfDecimals;
    if (decimals === undefined && this.props.pricesAreDecimal !== undefined) {
      decimals = this.props.pricesAreDecimal ? 2 : 0;
    }
    decimals = decimals === undefined ? getDecimalPlaces(value) : decimals;

    if (this.props.allowDecimals === false) {
      decimals = 0;
    }

    return new Intl.NumberFormat(this.props.thousandSeparator, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  parseRawValue = (raw) => {
    const normalized = this.normalizeNumberInput(raw);
    return parseLocalizedNumber(normalized, this.props.thousandSeparator);
  };

  handleKeyPress = (event) => {
    if (event.key === ".") {
      if (this.props.allowDecimals === false || this.props.numberOfDecimals === 0) {
        event.preventDefault();
      }
    }
  };

  handleChange = (val) => {
    const raw = val;
    this.setState({ rawValue: raw });
    
    const normalized = this.normalizeNumberInput(raw);
    const value = parseLocalizedNumber(normalized, this.props.thousandSeparator);
    
    if (!Object.is(value, this.props.value)) {
      this.props.onChange(Number.isNaN(value) ? undefined : value);
    }
  };

  handleBlur = () => {
    const { intl, displayNa } = this.props;
    const { rawValue } = this.state;
    
    this.setState({ isEdited: false });
    
    const normalized = this.normalizeNumberInput(rawValue);
    const number = Number.parseFloat(normalized);
    
    if ((rawValue === "" || Number.isNaN(number)) && displayNa) {
      this.setState({
        rawValue: formatMessage(intl, this.props.module, "core.NumberInput.notApplicable"),
      });
      return;
    }
    
    if (isNaN(number)) {
      this.setState({ rawValue: "" });
      return;
    }
    
    this.setState({ rawValue: this.formatNumber(number, intl) });
  };

  handleFocus = () => {
    this.setState({ isEdited: true });
  };

  render() {
    const {
      intl,
      module = "core",
      min = null,
      max = null,
      value,
      error,
      thousandSeparator,
      numberOfDecimals,
      displayZero = false,
      displayNa = false,
      allowDecimals = true,
      pricesAreDecimal,
      decimal,
      ...others
    } = this.props;

    let inputProps = {
      ...this.props.inputProps,
      type: "text",
      onKeyPress: this.handleKeyPress,
    };

    let err = error;

    const normalized = this.normalizeNumberInput(this.state.rawValue);
    const numericValue = parseLocalizedNumber(normalized, this.props.thousandSeparator);

    if (min != null && numericValue < min) {
      err = formatMessageWithValues(intl, module, "validation.minValue", { value: numericValue, min });
    }
    if (max != null && numericValue > max) {
      err = formatMessageWithValues(intl, module, "validation.maxValue", { value: numericValue, max });
    }

    return (
      <StyledFormattedNumberInput>
        <TextInput
          {...others}
          module={module}
          value={this.state.rawValue}
          error={err}
          inputProps={inputProps}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
        />
      </StyledFormattedNumberInput>
    );
  }
}

export { StyledFormattedNumberInput };
export default withModulesManager(injectIntl(FormattedNumberInput));
