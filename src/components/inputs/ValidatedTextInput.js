import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Box, CircularProgress, InputAdornment } from "@material-ui/core";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import clsx from "clsx";
import { debounce } from "lodash";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";

import { TextInput, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useStyles } from "../../styles";
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
}) => {
  const modulesManager = useModulesManager();
  const classes = useStyles();
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
          value={value}
          inputProps={inputProps}
          endAdornment={
            <InputAdornment position="end" className={clsx(!error && classes.validIcon, error && classes.invalidIcon)}>
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
          required={required}
          type={type}
          onChange={debounce(onChange, DEFAULT_DEBOUNCE_TIME)}
          inputProps={inputProps}
          endAdornment={
            <InputAdornment position="end" className={clsx(!error && classes.validIcon, error && classes.invalidIcon)}>
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
