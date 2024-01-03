import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash-uuid";

import { FormControl, InputLabel, Select, MenuItem, IconButton } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import ClearIcon from "@material-ui/icons/Clear";
import FormattedMessage from "../generics/FormattedMessage";
import TextInput from "./TextInput";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
  formControl: {
    position: "relative",
  },
  iconButton: {
    position: "absolute",
    right: 0,
    padding: "8px",
  },
});

class SelectInput extends Component {
  _onChange = (e) => {
    if (this.props.value !== e.target.value) {
      this.props.onChange(JSON.parse(e.target.value));
    }
  };

  handleClear = () => {
    this.props.onChange("");
  };

  render() {
    const {
      classes,
      module,
      label,
      strLabel = null,
      name,
      options,
      value,
      disabled = false,
      readOnly = false,
      required = false,
      placeholder,
    } = this.props;
    if (!options) return null;
    let valueStr = null;
    if (!!readOnly) {
      valueStr = options.filter((o) => JSON.stringify(o.value) === JSON.stringify(value)).map((o) => o.label);
    }
    return (
      <Fragment>
        {!readOnly && (
          <FormControl required={required} fullWidth className={classes.formControl}>
            <InputLabel shrink={true} className={classes.label}>
              {strLabel ?? <FormattedMessage module={module} id={label} />}
            </InputLabel>
            <Select
              readOnly={readOnly}
              inputProps={{
                name: name,
                id: `${_.uuid()}-input`,
              }}
              value={!!value ? JSON.stringify(value) : null}
              onChange={this._onChange}
              // When there is a value, we pass a dummy div to effectively hide the default dropdown icon.
              // This allows us to make room for the clear icon without having two icons visible at the same time.
              IconComponent={value ? () => <div /> : undefined}
              disabled={disabled}
              endAdornment={
                // If there's a value, we render the clear icon. Clicking it calls handleClear, which resets the Select's value.
                !!value ? (
                  <IconButton onClick={this.handleClear} className={classes.iconButton}>
                    <ClearIcon />
                  </IconButton>
                ) : undefined
              }
              displayEmpty
            >
              {placeholder && (
                <MenuItem disabled value="">
                  <FormattedMessage module={module} id={placeholder} />
                </MenuItem>
              )}
              {options.map((option, idx) => (
                <MenuItem key={`${module}-${name}-option-${idx}`} value={JSON.stringify(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {!!readOnly && <TextInput fullWidth={true} module={module} label={label} value={valueStr} readOnly={true} />}
      </Fragment>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(SelectInput)));
