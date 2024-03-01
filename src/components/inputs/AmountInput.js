import React from "react";
import { injectIntl } from "react-intl";
import { InputAdornment } from "@material-ui/core";
import NumberInput from "./NumberInput";
import { useModulesManager } from "../../helpers/modules";

const AmountInput = ({ intl, inputMinValue = 0, ...props }) => {
  const modulesManager = useModulesManager();
  const position = modulesManager.getConf("fe-core", "AmountInput.currencyPosition", "start");

  if (!["start", "end"].includes(position)) {
    throw new Error(`Position ${position} is not accepted. Only 'start' and 'end' are valid options.`);
  }

  const extraProps = {
    [`${position}Adornment`]: (
      <InputAdornment position={position}>{intl.formatMessage({ id: "currency" })}</InputAdornment>
    ),
    min: inputMinValue,
  };

  return <NumberInput {...props} {...extraProps} />;
};

export default injectIntl(AmountInput);
