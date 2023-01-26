import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import FormattedMessage from "../generics/FormattedMessage";
import TextInput from "./TextInput";
import _ from "lodash-uuid";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

class SelectInput extends Component {
  _onChange = (e) => {
    if (this.props.value !== e.target.value) {
      this.props.onChange(JSON.parse(e.target.value));
    }
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
          <FormControl required={required} fullWidth>
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
              disabled={disabled}
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
