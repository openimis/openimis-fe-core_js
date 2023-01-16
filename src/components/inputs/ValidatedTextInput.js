import { debounce } from "lodash";
import { InputAdornment, CircularProgress, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextInput, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import clsx from "clsx";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";
import React, { useEffect, useRef } from "react";

const useStyles = makeStyles((theme) => ({
  validIcon: {
    color: "green",
  },
  invalidIcon: {
    color: theme.palette.error.main,
  },
}));

const UniqueValueValidation = ({
  action,
  className,
  clearAction,
  codeMaxLength,
  codeTakenLabel,
  feModule,
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
      inputProps={{
        maxLength: modulesManager.getConf(feModule, codeMaxLength, inputProps.maxLength),
      }}
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

export default UniqueValueValidation;
