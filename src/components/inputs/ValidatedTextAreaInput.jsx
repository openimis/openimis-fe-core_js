import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import GetIconComponent from "../../helpers/icons";

import { Box, CircularProgress, InputAdornment } from "@mui/material";
const CheckOutlinedIcon = GetIconComponent("Check");
import { debounce } from "lodash";
const ErrorOutlineOutlinedIcon = GetIconComponent("Error");

import TextAreaInput from "./TextAreaInput";
import { useModulesManager } from "../../helpers/modules";
import { useTranslations } from "../../helpers/i18n";
import { ValidIcon, InvalidIcon } from "../../styles";
import { DEFAULT_DEBOUNCE_TIME } from "../../constants";

const ValidatedTextAreaInput = ({
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
  // Only when it changes: on React 19 a setState that changes nothing can still schedule a
  // render, from these effects at low priority. One per keystroke, never run while keystrokes
  // keep coming in one task (Cypress typing with no delay, a barcode scanner), made React count
  // every commit as nested and throw "Maximum update depth exceeded" past 50 characters.
  const setPending = (pending) => {
    if (pending !== isValidationPending) setValidationPending(pending);
  };
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
      setPending(false);
      !!setValidAction && dispatch(setValidAction());
      return undefined;
    }
    if (!value) {
      checkValidity.cancel();
      setPending(false);
      !!clearAction && dispatch(clearAction());
      return undefined;
    }
    const queryVariables = { [itemQueryIdentifier]: value, ...(additionalQueryArgs ?? {}) };
    setPending(true);
    checkValidity(queryVariables);
    return () => checkValidity.cancel();
  }, [value, shouldBeValidated]);

  // The pending window closes as soon as the store reports back on this field.
  useEffect(() => setPending(false), [isValid, isValidating, validationError]);

  // Leaving the form must not leave a verdict about a value that is no longer edited.
  useEffect(() => () => void (!!clearAction && dispatch(clearAction())), []);

  return (
    <>
      {shouldBeValidated ? (
        <TextAreaInput
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
        <TextAreaInput
          module={module}
          label={label}
          autoFocus={autoFocus}
          value={value}
          readOnly={readOnly}
          error={error}
          required={required}
          type={type}
          onChange={onChange}
          inputProps={inputProps}
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

export default ValidatedTextAreaInput;
