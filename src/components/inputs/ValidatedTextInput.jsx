import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import GetIconComponent from "../../helpers/icons";

import { Box, CircularProgress, InputAdornment } from "@mui/material";
const CheckOutlinedIcon = GetIconComponent("CheckOutlined");
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
  debounceTime = DEFAULT_DEBOUNCE_TIME,
}) => {
  const modulesManager = useModulesManager();

  const dispatch = useDispatch();
  const { formatMessage } = useTranslations(module, modulesManager);
  const shouldBeValidated = shouldValidate(value);

  // The validation query is debounced so that it is sent once the user stopped typing
  // instead of on every keystroke. `isValidationPending` covers the gap between the last
  // keystroke and the request actually being sent, so that neither the previous verdict
  // nor the "not yet validated" state is displayed while the value is still changing.
  const [isValidationPending, setValidationPending] = useState(false);
  const checkValidity = useMemo(
    () => debounce((queryVariables) => dispatch(action(modulesManager, queryVariables)), debounceTime),
    [dispatch, action, modulesManager, debounceTime],
  );

  const checkError = () => {
    if (validationError || (!isValidationPending && !isValidating && !isValid && value)) {
      return formatMessage(codeTakenLabel);
    }
    if (invalidValueFormat) {
      return formatMessage(invalidValueFormatLabel);
    }
    return null;
  };
  const error = checkError();
  const isBusy = isValidationPending || isValidating;

  useEffect(() => {
    if (!shouldBeValidated) {
      checkValidity.cancel();
      setValidationPending(false);
      !!setValidAction && dispatch(setValidAction());
      return undefined;
    }
    if (!value) {
      checkValidity.cancel();
      setValidationPending(false);
      !!clearAction && dispatch(clearAction());
      return undefined;
    }
    const queryVariables = { [itemQueryIdentifier]: value, ...(additionalQueryArgs ?? {}) };
    setValidationPending(true);
    checkValidity(queryVariables);
    return () => checkValidity.cancel();
  }, [value, shouldBeValidated]);

  // The pending window closes as soon as the store reports back on this field.
  useEffect(() => setValidationPending(false), [isValid, isValidating, validationError]);

  // Leaving the form must not leave a verdict about a value that is no longer edited.
  useEffect(() => () => void (!!clearAction && dispatch(clearAction())), []);

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
                {isBusy && value && (
                  <Box mr={1}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                {value && !isBusy && !error && <CheckOutlinedIcon size={20} />}
                {value && !isBusy && error && <ErrorOutlineOutlinedIcon size={20} />}
              </>
            </InputAdornment>
          }
          onChange={onChange}
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
          onChange={onChange}
          inputProps={inputProps}
          maxLengthKey={maxLengthKey}
          endAdornment={
            <InputAdornment position="end" component={!error ? ValidIcon : InvalidIcon}>
              <>
                {isBusy && value && (
                  <Box mr={1}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                {value && !isBusy && !error && <CheckOutlinedIcon size={20} />}
                {value && !isBusy && error && <ErrorOutlineOutlinedIcon size={20} />}
              </>
            </InputAdornment>
          }
        />
      )}
    </>
  );
};

export default ValidatedTextInput;
