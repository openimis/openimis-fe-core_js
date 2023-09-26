import React, { useState } from "react";
import { useModulesManager, useTranslations, useGraphqlQuery } from "@openimis/fe-core";
import SelectInput from "../components/inputs/SelectInput";

const EconomicUnitPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    value,
    label,
  } = props;


  const options = [{ value: "eloo", label: "eloo" }]

  return (
    <SelectInput
      label={!!withLabel && label? label: " "}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
    />
  );
};

export default EconomicUnitPicker;
