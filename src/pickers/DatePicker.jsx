import React, { Component } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import moment from "moment";
import dayjs from "dayjs";
import { injectIntl } from "../helpers/i18n";

import { styled } from "@mui/material/styles";
import { FormControl, FormLabel } from "@mui/material";
import { LocalizationProvider, DatePicker as MUIDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { formatMessage, toISODate } from "../helpers/i18n";
import withModulesManager from "../helpers/modules";
import withHistory from "../helpers/history";
import { DEFAULT } from "../constants";

import DatePicker from "react-multi-date-picker";
import nepali from "../calendars/NepalCalendar";
import nepali_en from "../calendars/NepaliLocaleEn";
import nepali_np from "../calendars/NepaliLocaleNp";

import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

const StyledDatePicker = styled('div')(({ theme }) => ({
  // Ensure custom (non-MUI) date pickers (e.g. secondary calendar) inherit theme colors
  '& label': {
    color: theme.palette.text.secondary,
  },
  '& input': {
    color: theme.palette.text.primary,
  },
  "& .disabledStateVisibilityBoost": {
    "& .MuiFormLabel-root.Mui-disabled": {
      color: theme.palette.text.secondary,
    },
    "& .MuiInputBase-input.Mui-disabled": {
      color: theme.palette.text.primary,
    },
    "& .MuiInput-underline:before": {
      borderBottom: `1px dotted ${theme.palette.text.disabled || theme.palette.divider}`,
    },
  },
}));

function fromISODateToDayjs(s) {
  if (!s) return null;
  return dayjs(s);
}

const NO_VALUE_YET = Symbol("no value yet");

class openIMISDatePicker extends Component {
  constructor(props) {
    super(props);
    this.disabledVisibilityBoost = props.modulesManager.getConf(
      "fe-core",
      "Input.disabledVisibilityBoost",
      DEFAULT.DISABLED_VISIBILITY_BOOST,
    );
    this.inputVariant = props.modulesManager.getConf(
        "fe-core",
        "Input.variant",
        DEFAULT.INPUT_VARIANT,
      );
  }

  state = {
    value: null,
    // The `value` prop `value` was last taken from; nothing yet, so the first render takes it.
    propValue: NO_VALUE_YET,
  };

  // Takes a new `value` prop in the render that receives it. Copying it from
  // componentDidUpdate cost a second commit per change, which React 19 counts as nested
  // while other work waits and throws "Maximum update depth exceeded" past 50.
  static getDerivedStateFromProps(props, state) {
    if (props.value === state.propValue) return null;
    return { value: props.value ? fromISODateToDayjs(props.value) : null, propValue: props.value };
  }

  dateChange = (d, context) => {
    if ((d && !d.isValid()) || (!d && context?.validationError && context.validationError !== 'required')) {
      return;
    }
    const jsDate = d ? d.toDate() : null;
    this.setState({ value: d });
    // Called from the event, not from a setState callback: React then commits the caller's
    // update together with this one. From the callback, it is a nested update of the
    // commit, and React 19 throws after 50 of them when changes come in one burst.
    this.props.onChange?.(toISODate(jsDate));
  };

  secondaryCalendarDateChange = (d) => {
    this.setState({ value: toISODate(d.toDate()) });
    this.props.onChange?.(toISODate(d.toDate()));
  };

  clearDate = (e) => {
    e.preventDefault();
    this.setState({ value: null });
  };

  setMinDate = () => {
    const { disablePast, minDate } = this.props;

    return { minDate: this.moveByOneDay(disablePast ? new Date() : new Date(minDate)) };
  };

  secondaryCalendarsOptions = {
    "nepali": nepali,
    "default": gregorian,
  };

  secondaryCalendarsLocaleOptions = {
    "nepali_en": nepali_en,
    "nepali_np": nepali_np,
    "default": gregorian_en,
  };

  getDictionaryValueOrDefault = (_dictionary, _key) => {
    return _key in _dictionary ? _dictionary[_key] : _dictionary["default"];
  };

  // for some reason multi-date-picker picks incorrect date
  // we need to add one day for it to works correctly
  // it is possible, that future release of library will fix it
  // making this method redundant
  moveByOneDay = (date) => {
    date.setDate(date.getDate() + 1);
    return date;
  };

  render() {
    const {
      intl,
      disablePast,
      module,
      label,
      readOnly = false,
      disabled = false,
      required = false,
      fullWidth = true,
      format = "DD-MM-YYYY",
      reset,
      isSecondaryCalendarEnabled,
      modulesManager,
      minDate,
      maxDate,
      inputVariant,
      ...otherProps
    } = this.props;

    const toBool = (v) => {
      if (v === false || v === "false" || v === 0 || v === "0" || v == null || v === "") return false;
      return !!v;
    };
    const isDisabled = toBool(readOnly) || toBool(disabled);

    if (isSecondaryCalendarEnabled) {
      const secondCalendarFormatting = modulesManager.getConf("fe-core", "secondCalendarFormatting", format);
      const secondCalendarType = modulesManager.getConf("fe-core", "secondCalendarType", "nepali");
      const secondCalendarLocale = modulesManager.getConf("fe-core", "secondCalendarLocale", "nepali_en");

      return (
        <StyledDatePicker>
          <FormControl fullWidth={fullWidth} required={required}>
            <FormLabel>{label ? formatMessage(intl, module, label) : null}</FormLabel>
            <DatePicker
              format={secondCalendarFormatting}
              disabled={isDisabled}
              value={this.state.value ? this.moveByOneDay(new Date(this.state.value)) : null}
              {...((minDate || disablePast) && this.setMinDate())}
              {...(maxDate && { maxDate: this.moveByOneDay(new Date(maxDate)) })}
              onChange={this.secondaryCalendarDateChange}
              highlightToday={false}
              calendar={this.getDictionaryValueOrDefault(this.secondaryCalendarsOptions, secondCalendarType)}
              locale={this.getDictionaryValueOrDefault(this.secondaryCalendarsLocaleOptions, secondCalendarLocale)}
            >
              <button style={{ margin: "5px" }} onClick={(e) => this.clearDate(e)}>
                {formatMessage(intl, "core", "calendar.clearButton")}
              </button>
            </DatePicker>
          </FormControl>
        </StyledDatePicker>
      );
    } else {
      const slotProps = {
        ...otherProps.slotProps,
        actionBar: {
          ...(otherProps.slotProps?.actionBar ?? undefined),
          actions: otherProps.slotProps?.actionBar?.actions ?? ["clear", "cancel", "accept"],
        },
        toolbar: {
          ...(otherProps.slotProps?.toolbar ?? undefined),
          hidden: otherProps.slotProps?.toolbar?.hidden ?? false,
          sx: {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            "& .MuiTypography-root": {
              color: "white",
            },
          },
        },
        textField: {
          ...(otherProps.slotProps?.textField ?? undefined),
          required,
          variant: inputVariant ?? this.inputVariant,
        },
      };

      return (
        <StyledDatePicker>
          <FormControl fullWidth={fullWidth} required={required}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MUIDatePicker
                {...otherProps}
                slotProps={slotProps}
                maxDate={maxDate ? dayjs(maxDate) : undefined}
                minDate={minDate ? dayjs(minDate) : undefined}
                format={format}
                disabled={isDisabled}
                className={clsx({
                  "disabledStateVisibilityBoost": this.disabledVisibilityBoost && isDisabled,
                })}
                value={this.state.value}
                label={label ? formatMessage(intl, module, label) : null}
                onChange={this.dateChange}
                disablePast={disablePast}
              />
            </LocalizationProvider>
          </FormControl>
        </StyledDatePicker>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  isSecondaryCalendarEnabled: state.core.isSecondaryCalendarEnabled ?? false,
});

export { StyledDatePicker };
export { openIMISDatePicker };
export default injectIntl(withModulesManager(withHistory(connect(mapStateToProps, null)(openIMISDatePicker))));
