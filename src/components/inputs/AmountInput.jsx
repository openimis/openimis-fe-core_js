import React, { useMemo } from "react";
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

  const currency = intl.formatMessage({ id: "currency" });
  // The same element from one render to the next: MUI's input reports a new adornment to its
  // FormControl from an effect, so a new one on every render leaves low-priority work after
  // each commit. React 19 counts every commit made while such work waits as a nested update
  // and throws "Maximum update depth exceeded" on a burst of keystrokes elsewhere in the form.
  const adornment = useMemo(
    () => <InputAdornment position={position}>{currency}</InputAdornment>,
    [position, currency],
  );

  const extraProps = {
    [`${position}Adornment`]: adornment,
    min: inputMinValue,
    numberOfDecimals: numberOfDecimals ?? defaultNumberOfDecimals,
  };

  return <NumberInput {...props} {...extraProps} />;
};

export { AmountInput };
export default injectIntl(AmountInput);
