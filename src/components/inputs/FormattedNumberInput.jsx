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
    if (prevProps.value !== this.props.value && !this.state.isEdited) {
      this.setState({
        rawValue: this.props.value != null ? this.formatNumber(this.props.value) : "",
      });
    }
  }

  formatNumber = (value) => {
    if (value == null || isNaN(value)) return "";

    let decimals = this.props.numberOfDecimals;
    if (decimals === undefined && this.props.pricesAreDecimal !== undefined) {
      decimals = this.props.pricesAreDecimal ? 2 : 0;
    }
    decimals = decimals === undefined ? getDecimalPlaces(value) : decimals;

    return new Intl.NumberFormat(this.props.thousandSeparator, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  handleKeyPress = (event) => {
    if (event.key === ".") {
      if (this.props.allowDecimals === false || this.props.numberOfDecimals === 0) {
        event.preventDefault();
      }
    }
  };

  parseRawValue = (raw) => parseLocalizedNumber(raw, this.props.thousandSeparator);

  handleChange = (val) => {
    const raw = val;
    this.setState({ rawValue: raw });

    const value = this.parseRawValue(raw);
    this.props.onChange(isNaN(value) ? undefined : value);
  };

  handleBlur = () => {
    const { intl, displayNa } = this.props;
    const { rawValue } = this.state;

    this.setState({ isEdited: false });

    if ((rawValue === "" || isNaN(Number(rawValue))) && displayNa) {
      this.setState({
        rawValue: formatMessage(intl, this.props.module, "core.NumberInput.notApplicable"),
      });
      return;
    }

    const number = this.parseRawValue(rawValue);
    if (isNaN(number)) {
      this.setState({ rawValue: "" });
      return;
    }

    this.setState({ rawValue: this.formatNumber(number) });
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

    const numericValue = this.parseRawValue(this.state.rawValue);
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
