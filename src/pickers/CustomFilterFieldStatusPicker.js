import React from "react";
import SelectInput from "../components/inputs/SelectInput";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";

const CustomFilterFieldStatusPicker = ({
  intl,
  value,
  label,
  onChange,
  readOnly = false,
  withNull = false,
  nullLabel = null,
  withLabel = true,
  required = false,
  customFilters,
}) => {

  const options = Array.isArray(customFilters) && customFilters !== undefined ?  [
    ...customFilters.map((customFilter) => ({
        value: { field: customFilter.field, type: customFilter.type },
        label: customFilter.field
    }))
  ] : [];

  if (withNull) {
    options.unshift({
      value: null,
      label: nullLabel || ""
    });
  }

  return (
    <SelectInput
      module="core"
      label={withLabel && label}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
    />
  );
};

export default injectIntl(CustomFilterFieldStatusPicker);
