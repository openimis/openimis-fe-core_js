import React from "react";
import GetIconComponent from "../../helpers/icons";

import TextAreaInput from "./TextAreaInput";
import { useServerValidation, ValidationAdornment } from "./useServerValidation";

const CheckOutlinedIcon = GetIconComponent("Check");
const ErrorOutlineOutlinedIcon = GetIconComponent("Error");

const ValidatedTextAreaInput = ({
  autoFocus,
  className,
  inputProps,
  label,
  module,
  onChange,
  placeholder,
  readOnly,
  required,
  type,
  ...validation
}) => {
  const { value } = validation;
  const { error, isBusy, shouldBeValidated } = useServerValidation({ module, ...validation });
  const endAdornment = (
    <ValidationAdornment
      value={value}
      isBusy={isBusy}
      error={error}
      ValidStateIcon={CheckOutlinedIcon}
      InvalidStateIcon={ErrorOutlineOutlinedIcon}
    />
  );

  const fieldProps = {
    module,
    label,
    autoFocus,
    value,
    readOnly,
    error,
    required,
    type,
    onChange,
    inputProps,
    endAdornment,
  };

  // Only a field that is checked against the server takes the page's className and placeholder.
  return shouldBeValidated ? (
    <TextAreaInput {...fieldProps} className={className} placeholder={placeholder} />
  ) : (
    <TextAreaInput {...fieldProps} />
  );
};

export default ValidatedTextAreaInput;
