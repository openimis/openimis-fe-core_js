import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
  // NOTE: This is used to hide the increment/decrement arrows from the number input
  numberInput: {
    '& input[type=number]': {
        '-moz-appearance': 'textfield'
    },
    '& input[type=number]::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0
    },
    '& input[type=number]::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0
    }
  },
});

class TextInput extends Component {
  state = {
    value: "",
  };
  componentDidMount() {
    let value = this.props.value;
    if (!!this.props.formatInput) {
      value = this.props.formatInput(value);
    }
    if (value !== this.state.value) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset || prevProps.value !== this.props.value) {
      let value = this.props.value;
      if (!!this.props.formatInput) {
        value = this.props.formatInput(value);
      }
      if (value !== this.state.value) {
        this.setState({ value });
      }
    }
  }
  _onChange = (e) => {
    let {value} = e.target;
    if (this.props.formatInput) {
      value = this.props.formatInput(value);
    }
    if (value !== this.state.value) {
      this.setState({ value }, () => this.props.onChange && this.props.onChange(this.state.value));
    }
  };
  render() {
    const {
      intl,
      classes,
      module,
      label,
      readOnly = false,
      error = null,
      startAdornment = null,
      endAdornment = null,
      inputProps = {},
      formatInput = null,
      helperText,
      ...others
    } = this.props;
    return (
      <TextField
        {...others}
        className={classes.numberInput}
        fullWidth
        disabled={readOnly}
        label={!!label && formatMessage(intl, module, label)}
        InputLabelProps={{
          className: classes.label,
        }}
        InputProps={{ inputProps, startAdornment, endAdornment }}
        onChange={this._onChange}
        value={this.state.value}
        error={Boolean(error)}
        helperText={error ?? helperText}
      />
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(TextInput)));
