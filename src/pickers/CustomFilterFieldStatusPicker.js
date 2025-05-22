import React from "react";

import SelectInput from "../components/inputs/SelectInput";
import { MODULE_NAME } from "../constants";
import { useTranslations } from "../helpers/i18n";

const CustomFilterFieldStatusPicker = ({
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
  const { formatMessage } = useTranslations(MODULE_NAME);

  const options =
    Array.isArray(customFilters) && customFilters !== undefined
      ? [
          ...customFilters.map((customFilter) => ({
            value: { field: customFilter.field, type: customFilter.type },
            label: formatMessage(`advancedFilters.${customFilter.field}`),
          })),
        ]
      : [];

  if (withNull) {
    options.unshift({
      value: null,
      label: nullLabel || "",
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

export default CustomFilterFieldStatusPicker;
