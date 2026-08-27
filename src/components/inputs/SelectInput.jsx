import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash-uuid";

import { MenuItem, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import GetIconComponent from "../../helpers/icons";

const ClearIcon = GetIconComponent("Clear");
import FormattedMessage from "../generics/FormattedMessage";
import TextInput from "./TextInput";
import { formatMessage } from "../../helpers/i18n";

const StyledSelectInput = styled("div")(({ theme }) => ({
  "& .formControl": {
    position: "relative",
    minWidth: "120px",
    width: "100%",
  },
  "& .MuiSelect-select": {
    minWidth: "120px",
  },
  "& .iconButton": {
    position: "absolute",
    right: 0,
    padding: "8px",
  },
}));

function EmptyComponent() {
  return <div />;
}

class SelectInput extends Component {
  constructor(props) {
    super(props);
    this.uuid = props.name || _.uuid();
  }

  _onChange = (e) => {
    const { value } = e.target;
    if (this.props.value !== value) {
      const parsedValue = value === "" || value === null ? null : JSON.parse(value);
      this.props.onChange(parsedValue);
    }
  };

  handleClear = () => {
    this.props.onChange(null);
  };

  // When there is a value, we pass a dummy div to effectively hide the default dropdown icon.
  // This allows us to make room for the clear icon without having two icons visible at the same time.
  renderIconComponent = () => {
    const { value } = this.props;
    return value ? EmptyComponent : undefined;
  };

  // If there's a value, we render the clear icon. Clicking it calls handleClear, which resets the Select's value.
  renderEndAdornment = () => {
    const { value } = this.props;
    return value ? (
      <IconButton onClick={this.handleClear} className="iconButton">
        <ClearIcon />
      </IconButton>
    ) : undefined;
  };

  render() {
    const {
      intl,
      module,
      label,
      strLabel = null,
      withLabel = true,
      name,
      options,
      value,
      disabled = false,
      readOnly = false,
      required = false,
      placeholder,
      title = "",
    } = this.props;
    if (!options) return null;
    let valueStr = null;
    if (!!readOnly) {
      valueStr = options.filter((o) => JSON.stringify(o.value) === JSON.stringify(value)).map((o) => o.label);
    }
    const labelText = strLabel ?? (label ? formatMessage(intl, module, label) : null);
    const moduleProp = intl?.messages?.[`${module}.pickerNoOptionsLabel`] ? module : "core";
    const selectValue = value === null || value === undefined ? "" : JSON.stringify(value);
    return (
      <StyledSelectInput>
        <Fragment>
          {!readOnly && (
            <TextField
              select
              fullWidth
              required={required}
              disabled={disabled}
              label={withLabel ? labelText : undefined}
              id={this.uuid}
              name={name}
              value={selectValue}
              onChange={this._onChange}
              InputProps={{
                endAdornment: this.renderEndAdornment(),
              }}
              SelectProps={{
                labelId: `label-${this.uuid}`,
                label: withLabel ? labelText : undefined,
                IconComponent: this.renderIconComponent(),
                displayEmpty: !!placeholder,
                ...(withLabel ? null : { style: { marginTop: "0px" } }),
              }}
              title={title}
            >
              {placeholder && (
                <MenuItem disabled value="">
                  <FormattedMessage module={module} id={placeholder} />
                </MenuItem>
              )}

              {options.length === 0 && (
                <MenuItem disabled key={`${module}-${name}-option-0`}>
                  <FormattedMessage module={moduleProp} id="pickerNoOptionsLabel" />
                </MenuItem>
              )}

              {options.map((option, idx) => (
                <MenuItem
                  key={`${module}-${name}-option-${idx}`}
                  value={option.value === null ? "" : JSON.stringify(option.value)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {!!readOnly && (
            <TextInput
              //NOTE: We want to get rid of default styling (marginTop) if label is not rendered
              {...(withLabel ? { label } : null)}
              fullWidth={true}
              module={module}
              value={valueStr}
              readOnly={true}
              title={title}
            />
          )}
        </Fragment>
      </StyledSelectInput>
    );
  }
}

export { StyledSelectInput };
export default injectIntl(SelectInput);
