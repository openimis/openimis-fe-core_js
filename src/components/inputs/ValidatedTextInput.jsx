import React from "react";
import GetIconComponent from "../../helpers/icons";

import TextInput from "./TextInput";
import { useServerValidation, ValidationAdornment } from "./useServerValidation";

const CheckOutlinedIcon = GetIconComponent("CheckOutlined");
const ErrorOutlineOutlinedIcon = GetIconComponent("ErrorOutlineOutlined");

const ValidatedTextInput = ({
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
  maxLengthKey,
  showValidationErrorAsHelperText = false,
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
    helperText: showValidationErrorAsHelperText ? error : null,
    maxLengthKey,
    endAdornment,
  };

  // Only a field that is checked against the server takes the page's className and placeholder.
  return shouldBeValidated ? (
    <TextInput {...fieldProps} className={className} placeholder={placeholder} />
  ) : (
    <TextInput {...fieldProps} />
  );
};

export default ValidatedTextInput;
