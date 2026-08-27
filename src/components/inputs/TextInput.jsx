import React, { Component } from "react";
import clsx from "clsx";
import { connect } from "react-redux";
import { styled } from "@mui/material/styles";
import { injectIntl } from "react-intl";
import { TextField } from "@mui/material";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import { DEFAULT } from "../../constants";
import withModulesManager from "../../helpers/modules";

const StyledTextInput = styled("div")(({ theme }) => ({
  "& .label": {
    color: theme.palette.primary.main,
  },
  // NOTE: This is used to hide the increment/decrement arrows from the number input
  "& .numberInput": {
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
  "& .disabledStateVisibilityBoost": {
    "& .Mui-disabled": {
      color: "#5E5B50",
    },
    "& .MuiInput-underline:before": {
      borderBottom: `1px dotted #5E5B50`,
    },
    "& .MuiFormLabel-root.Mui-disabled": {
      color: "#181716",
    },
  },
}));

const getNestedValue = (object, path) =>
  path?.split(".").reduce((current, key) => current?.[key], object);

class TextInput extends Component {
  constructor(props) {
    super(props);
    this.disabledVisibilityBoost = props.modulesManager.getConf(
      "fe-core",
      "Input.disabledVisibilityBoost",
      DEFAULT.DISABLED_VISIBILITY_BOOST,
    );
  }

  state = {
    value: "",
    maxLengthReached: false,
    maxLength: null,
  };
  componentDidMount() {
    let value = this.props.value ?? "";
    if (!!this.props.formatInput) {
      value = this.props.formatInput(value);
    }
    if (value !== this.state.value) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset || prevProps.value !== this.props.value) {
      let value = this.props.value ?? "";
      if (!!this.props.formatInput) {
        value = this.props.formatInput(value);
      }
      if (value !== this.state.value) {
        this.setState({ value });
      }
    }
  }

  getMaxLength = () => {
    const { constraints } = this.props.maxLengthConstraints || {};
    const { inputProps = {}, label, maxLengthKey, module } = this.props;

    if (inputProps.maxLength) {
      return inputProps.maxLength;
    }

    if (maxLengthKey) {
      return getNestedValue(constraints, maxLengthKey);
    }

    const labelParts = label?.split(".");
    const field = labelParts?.[1];
    const form = labelParts?.[0]?.toLowerCase();
    const moduleConstraints = constraints?.[module];

    return moduleConstraints?.[form]?.[field] || moduleConstraints?.[field];
  };

  _onChange = (e) => {
    let { value } = e.target;

    let maxLengthReached = false;
    let maxLength = this.getMaxLength();

    if (this.props.formatInput) {
      value = this.props.formatInput(value);
    }

    if (maxLength && value.length > maxLength) {
      value = value.slice(0, maxLength);
      maxLengthReached = true;
    } else if (maxLength && value.length >= maxLength) {
      maxLengthReached = true;
    }

    this.setState(
      {
        value,
        maxLengthReached,
        maxLength,
      },
      () => {
        this.props.onChange?.(this.state.value);
      }
    );
  };

  render() {
    const {
      intl,
      module,
      label,
      readOnly = false,
      error = null,
      startAdornment = null,
      endAdornment = null,
      inputProps = {},
      formatInput = null,
      helperText,
      type,
      modulesManager,
      ...others
    } = this.props;

    const maxLength = this.getMaxLength();
    const effectiveInputProps = maxLength ? { ...inputProps, maxLength } : inputProps;
    const err = error || this.state.maxLengthReached;
    const msg = this.state.maxLengthReached ? formatMessageWithValues(this.props.intl, "core", "input.maxLengthReached", { max: this.state.maxLength }) : helperText;
    return (
      <StyledTextInput>
        <TextField
          {...others}
          className={clsx({
            "numberInput": true,
            "disabledStateVisibilityBoost": this.disabledVisibilityBoost && readOnly,
          })}
          fullWidth
          disabled={readOnly}
          label={!!label && formatMessage(intl, module, label)}
          InputLabelProps={{
            className: "label",
          }}
          InputProps={{ inputProps: effectiveInputProps, startAdornment, endAdornment }}
          onChange={this._onChange}
          value={this.state.value}
          error={Boolean(err)}
          helperText={msg}
          type={type}
        />
      </StyledTextInput>
    );
  }
}

const mapStateToProps = (state) => ({
  maxLengthConstraints: state.core.maxLengthConstraints,
});

export { StyledTextInput };
export default withModulesManager(connect(mapStateToProps)(injectIntl(TextInput)));
