import React, { Component } from "react";
import { styled } from "@mui/material/styles";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import withModulesManager from "../../helpers/modules";

const StyledFormattedNumberInput = styled("div")(({ theme }) => ({}));

class FormattedNumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
      rawValue: props.value != null ? this.formatNumber(props.value, props.intl) : "",
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && !this.state.isEdited) {
      this.setState({
        rawValue: this.props.value != null ? this.formatNumber(this.props.value, this.props.intl) : "",
      });
    }
  }

  formatNumber = (value, intl) => {
    if (!value || Number.isNaN(value)) return "";
    return new Intl.NumberFormat(this.props.thousandSeparator, {
      minimumFractionDigits: this.props.pricesAreDecimal ? this.props.numberOfDecimals : 0,
      maximumFractionDigits: this.props.pricesAreDecimal ? this.props.numberOfDecimals : 0,
    }).format(value);
  };

  handleKeyPress = (event) => {
    const { allowDecimals = true } = this.props;
    if (event.key === "." && !allowDecimals) {
      event.preventDefault();
    }
  };

  handleChange = (val) => {
    const raw = val;
    this.setState({ rawValue: raw });

    const normalized = raw.replace(/\s/g, "").replace(",", ".");
    const value = Number.parseFloat(normalized);
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

    const number = Number.parseFloat(rawValue.replace(/\s/g, "").replace(",", "."));
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
      error,
      allowDecimals = true,
      thousandSeparator,
      numberOfDecimals,
      pricesAreDecimal,
      ...others
    } = this.props;

    let inputProps = {
      ...this.props.inputProps,
      type: "text",
      onKeyPress: this.handleKeyPress,
    };

    let err = error;

    const numericValue = Number.parseFloat(this.state.rawValue.replace(/\s/g, "").replace(",", "."));
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
