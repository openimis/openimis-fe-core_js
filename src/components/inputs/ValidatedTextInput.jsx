import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import GetIconComponent from "../../helpers/icons";

import { Box, CircularProgress, InputAdornment } from "@mui/material";
const CheckOutlinedIcon = GetIconComponent("CheckOutlined");
import clsx from "clsx";
import { debounce } from "lodash";
const ErrorOutlineOutlinedIcon = GetIconComponent("ErrorOutlineOutlined");

import TextInput from "./TextInput";
import { useModulesManager } from "../../helpers/modules";
import { useTranslations } from "../../helpers/i18n";
import { ValidIcon, InvalidIcon } from "../../styles";
import { DEFAULT_DEBOUNCE_TIME } from "../../constants";

const ValidatedTextInput = ({
  action,
  additionalQueryArgs,
  autoFocus,
  className,
  clearAction,
  codeTakenLabel,
  inputProps,
  isValid,
  isValidating,
  itemQueryIdentifier,
  label,
  module,
  onChange,
  placeholder,
  readOnly,
  required,
  setValidAction,
  shouldValidate,
  type,
  validationError,
  value,
  invalidValueFormatLabel,
  invalidValueFormat,
  maxLengthKey,
  showValidationErrorAsHelperText = false,
}) => {
  const modulesManager = useModulesManager();

  const dispatch = useDispatch();
  const { formatMessage } = useTranslations(module, modulesManager);
  const shouldBeValidated = shouldValidate(value);
  const queryVariables = {};
  const checkValidity = (queryVariables) => dispatch(action(modulesManager, queryVariables));
  const checkError = () => {
    if (validationError || (!isValidating && !isValid && value)) {
      return formatMessage(codeTakenLabel);
    }
    if (invalidValueFormat) {
      return formatMessage(invalidValueFormatLabel);
    }
    return null;
  };
  const error = checkError();

  useEffect(() => {
    if (shouldBeValidated) {
      queryVariables[itemQueryIdentifier] = value;
      if (additionalQueryArgs) Object.entries(additionalQueryArgs).map((arg) => (queryVariables[arg?.[0]] = arg?.[1]));
      if (value) checkValidity(queryVariables);
      return () => (!value || isValid) && dispatch(clearAction());
    } else {
      !!setValidAction && dispatch(setValidAction());
      return () => (!value || isValid) && dispatch(clearAction());
    }
  }, [value]);

  return (
    <>
      {shouldBeValidated ? (
        <TextInput
          module={module}
          autoFocus={autoFocus}
          className={className}
          readOnly={readOnly}
          required={required}
          label={label}
          placeholder={placeholder}
          type={type}
          error={error}
          helperText={showValidationErrorAsHelperText ? error : null}
          value={value}
          inputProps={inputProps}
          maxLengthKey={maxLengthKey}
          endAdornment={
            <InputAdornment position="end" component={!error ? ValidIcon : InvalidIcon}>
              <>
                {isValidating && value && (
                  <Box mr={1}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                {value && !error && <CheckOutlinedIcon size={20} />}
                {value && error && <ErrorOutlineOutlinedIcon size={20} />}
              </>
            </InputAdornment>
          }
          onChange={debounce(onChange, DEFAULT_DEBOUNCE_TIME)}
        />
      ) : (
        <TextInput
          module={module}
          label={label}
          autoFocus={autoFocus}
          value={value}
          readOnly={readOnly}
          error={error}
          helperText={showValidationErrorAsHelperText ? error : null}
          required={required}
          type={type}
          onChange={debounce(onChange, DEFAULT_DEBOUNCE_TIME)}
          inputProps={inputProps}
          maxLengthKey={maxLengthKey}
          endAdornment={
            <InputAdornment position="end" component={!error ? ValidIcon : InvalidIcon}>
              <>
                {isValidating && value && (
                  <Box mr={1}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                {value && !error && <CheckOutlinedIcon size={20} />}
                {value && error && <ErrorOutlineOutlinedIcon size={20} />}
              </>
            </InputAdornment>
          }
        />
      )}
    </>
  );
};

export default ValidatedTextInput;
