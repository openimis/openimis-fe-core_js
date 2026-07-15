import React from "react";
import { injectIntl } from "react-intl";
import { InputAdornment } from "@mui/material";
import NumberInput from "./NumberInput";
import { useModulesManager } from "../../helpers/modules";

const AmountInput = ({ intl, inputMinValue = 0, numberOfDecimals, ...props }) => {
  const modulesManager = useModulesManager();
  const position = modulesManager.getConf("fe-core", "AmountInput.currencyPosition", "start");
  const defaultNumberOfDecimals = modulesManager.getConf("fe-core", "numberOfDecimals", 2);

  if (!["start", "end"].includes(position)) {
    throw new Error(`Position ${position} is not accepted. Only 'start' and 'end' are valid options.`);
  }

  const extraProps = {
    [`${position}Adornment`]: (
      <InputAdornment position={position}>{intl.formatMessage({ id: "currency" })}</InputAdornment>
    ),
    min: inputMinValue,
    numberOfDecimals: numberOfDecimals ?? defaultNumberOfDecimals,
  };

  return <NumberInput {...props} {...extraProps} />;
};

export { AmountInput };
export default injectIntl(AmountInput);
