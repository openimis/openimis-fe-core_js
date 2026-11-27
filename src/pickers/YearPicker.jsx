import React, { Component } from "react";
import { injectIntl, formatMessage } from "../helpers/i18n";
import SelectInput from "../components/inputs/SelectInput";
import _ from "lodash";

class YearPicker extends Component {
  render() {
    const {
      intl,
      name,
      value,
      module,
      label,
      nullLabel = "year.null",
      onChange,
      readOnly,
      min,
      max,
      required,
      withNull = true,
    } = this.props;
    const options = withNull
      ? [
          {
            value: null,
            label: formatMessage(intl, module, nullLabel),
          },
        ]
      : [];
    options.push(
      ..._.range(min, max).map((v) => ({
        value: v,
        label: v,
      })),
    );
    return (
      <SelectInput
        module={module}
        label={label}
        options={options}
        readOnly={readOnly}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
      />
    );
  }
}

export { YearPicker };
export default injectIntl(YearPicker);
