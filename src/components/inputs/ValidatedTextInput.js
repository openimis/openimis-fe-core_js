import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { Box, CircularProgress, InputAdornment } from "@material-ui/core";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import clsx from "clsx";
import { debounce } from "lodash";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";

import { TextInput, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useStyles } from "../../styles";

const ValidatedTextInput = ({
  action,
  className,
  clearAction,
  codeTakenLabel,
  inputProps,
  isValid,
  isValidating,
  label,
  module,
  onChange,
  placeholder,
  readOnly,
  required,
  validationError,
  value,
}) => {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations(module, modulesManager);

  const debounceResponse = useRef(
    debounce((value) => dispatch(action(modulesManager, { healthFacilityCode: value })), 800),
  ).current;

  useEffect(() => {
    if (value) debounceResponse(value);
    return () => (!value || isValid) && dispatch(clearAction());
  }, [value]);

  return (
    <TextInput
      module={module}
      className={className}
      disabled={readOnly}
      required={required}
      label={label}
      placeholder={placeholder}
      error={validationError || (!isValidating && !isValid && value) ? formatMessage(codeTakenLabel) : null}
      value={value}
      inputProps={inputProps}
      endAdornment={
        <InputAdornment
          position="end"
          className={clsx(isValid && value && classes.validIcon, !isValid && value && classes.invalidIcon)}
        >
          <>
            {isValidating && value && (
              <Box mr={1}>
                <CircularProgress size={20} />
              </Box>
            )}
            {!isValidating && isValid && value && <CheckOutlinedIcon size={20} />}
            {!isValidating && !isValid && value && <ErrorOutlineOutlinedIcon size={20} />}
          </>
        </InputAdornment>
      }
      onChange={onChange}
    />
  );
};

export default ValidatedTextInput;
