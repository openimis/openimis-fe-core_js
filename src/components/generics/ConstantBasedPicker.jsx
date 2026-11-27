import React, { Component } from "react";
import { injectIntl, formatMessage } from "../../helpers/i18n";
import { styled } from "@mui/material/styles";
import SelectInput from "../inputs/SelectInput";

const StyledConstantBasedPicker = styled("div")(({ theme }) => ({
  width: "100%",
  "& .MuiFormControl-root": {
    width: "100%",
  },
}));

const INIT_STATE = {
  value: null,
};

// The props `value` was last taken from: none yet, so the first render takes them.
const NO_PROPS_YET = { value: Symbol("no value yet"), reset: Symbol("no reset yet") };

class ConstantBasedPicker extends Component {
  state = { ...INIT_STATE, propValue: NO_PROPS_YET.value, propReset: NO_PROPS_YET.reset };

  // Takes a new `value` prop (or a reset) in the render that receives it. Copying it from
  // componentDidUpdate cost a second commit per change, which React 19 counts as nested
  // while other work waits and throws "Maximum update depth exceeded" past 50.
  static getDerivedStateFromProps(props, state) {
    if (state.propValue === NO_PROPS_YET.value) {
      // 0 is a constant like any other (e.g. the Error claim status), not "no value"
      return { value: props.value ?? null, propValue: props.value, propReset: props.reset };
    }
    if (props.reset !== state.propReset || props.value !== state.propValue) {
      return { value: props.value, propValue: props.value, propReset: props.reset };
    }
    return null;
  }

  _formatValue = (v) =>
    v === null
      ? formatMessage(this.props.intl, this.props.module, this.props.nullLabel ?? `${this.props.label}.null`)
      : formatMessage(this.props.intl, this.props.module, `${this.props.label}.${v}`);

  _onChange = (v) => {
    this.setState({ value: v });
    // Called from the event, not from a setState callback: React then commits the caller's
    // update together with this one. From the callback, it is a nested update of the commit.
    this.props.onChange(v, this._formatValue(v));
  };

  render() {
    const {
      module,
      withLabel = true,
      label,
      constants,
      name,
      filtered = [],
      withNull = true,
      readOnly = false,
      required = false,
    } = this.props;
    const { value } = this.state;
    if (!withNull && value === null && !!!constants) return null;
    const options = withNull
      ? [
          {
            value: null,
            label: this._formatValue(null),
          },
        ]
      : [];
    options.push(
      ...constants
        .filter((c) => !filtered.includes(c) || value === c)
        .map((v) => ({
          value: v,
          label: this._formatValue(v),
        })),
    );
    return (
      <StyledConstantBasedPicker>
        <SelectInput
          module={module}
          label={withLabel ? label : undefined}
          withLabel={withLabel}
          options={options}
          name={name}
          value={value}
          onChange={this._onChange}
          readOnly={readOnly}
          required={required}
        />
      </StyledConstantBasedPicker>
    );
  }
}

export { StyledConstantBasedPicker };
export default injectIntl(ConstantBasedPicker);
