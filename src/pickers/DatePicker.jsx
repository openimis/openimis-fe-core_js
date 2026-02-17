import React, { Component } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import moment from "moment";
import dayjs from "dayjs";
import { injectIntl } from "react-intl";

import { styled } from "@mui/material/styles";
import { FormControl } from "@mui/material";
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
  '& .label': {
    color: theme.palette.primary.main,
  },
  '& .disabledStateVisibilityBoost': {
    "& .MuiFormLabel-root.Mui-disabled": {
      color: "#181716",
    },
    "& .MuiInputBase-input.Mui-disabled": {
      color: "#5E5B50",
    },
    "& .MuiInput-underline:before": {
      borderBottom: `1px dotted #5E5B50`,
    },
  },
}));

function fromISODateToDayjs(s) {
  if (!s) return null;
  return dayjs(s);
}

class openIMISDatePicker extends Component {
  constructor(props) {
    super(props);
    this.disabledVisibilityBoost = props.modulesManager.getConf(
      "fe-core",
      "Input.disabledVisibilityBoost",
      DEFAULT.DISABLED_VISIBILITY_BOOST,
    );
  }

  state = {
    value: null,
  };

  componentDidMount() {
    this.setState((state, props) => ({ value: props.value ? fromISODateToDayjs(props.value) : null }));
  }

  componentDidUpdate(prevState, prevProps, snapshot) {
    if (prevState.value !== this.props.value) {
      this.setState((state, props) => ({ value: props.value ? fromISODateToDayjs(props.value) : null }));
    }
  }

  dateChange = (d) => {
    const jsDate = d ? d.toDate() : null;
    this.setState({ value: d }, () => (!!this.props.onChange ? this.props.onChange(toISODate(jsDate)) : null));
  };

  secondaryCalendarDateChange = (d) => {
    this.setState({ value: toISODate(d.toDate()) }, (i) =>
      !!this.props.onChange ? this.props.onChange(toISODate(d.toDate())) : null,
    );
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
      required = false,
      fullWidth = true,
      format = "DD-MM-YYYY",
      reset,
      isSecondaryCalendarEnabled,
      modulesManager,
      minDate,
      maxDate,
      inputProps,
      slotProps,
      ...otherProps
    } = this.props;

    if (isSecondaryCalendarEnabled) {
      const secondCalendarFormatting = modulesManager.getConf("fe-core", "secondCalendarFormatting", format);
      const secondCalendarType = modulesManager.getConf("fe-core", "secondCalendarType", "nepali");
      const secondCalendarLocale = modulesManager.getConf("fe-core", "secondCalendarLocale", "nepali_en");

      return (
        <StyledDatePicker>
          <FormControl fullWidth={fullWidth}>
            <label className="label">
              {!!label ? formatMessage(intl, module, label).concat(required ? " *" : "") : null}
            </label>
            <DatePicker
              format={secondCalendarFormatting}
              disabled={readOnly}
              value={this.state.value ? this.moveByOneDay(new Date(this.state.value)) : null}
              {...((!!minDate || disablePast) && this.setMinDate())}
              {...(!!maxDate && { maxDate: this.moveByOneDay(new Date(maxDate)) })}
              onChange={this.secondaryCalendarDateChange}
              highlightToday={false}
              calendar={this.getDictionaryValueOrDefault(this.secondaryCalendarsOptions, secondCalendarType)}
              locale={this.getDictionaryValueOrDefault(this.secondaryCalendarsLocaleOptions, secondCalendarLocale)}
              slotProps={slotProps}
            >
              <button style={{ margin: "5px" }} onClick={(e) => this.clearDate(e)}>
                {formatMessage(intl, "core", "calendar.clearButton")}
              </button>
            </DatePicker>
          </FormControl>
        </StyledDatePicker>
      );
    } else {
      return (
        <StyledDatePicker>
          <FormControl fullWidth={fullWidth}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MUIDatePicker
              {...otherProps}
              maxDate={maxDate ? dayjs(maxDate) : undefined}
              minDate={minDate ? dayjs(minDate) : undefined}
              format={format}
              disabled={readOnly}
              required={required}
              className={clsx({
                "disabledStateVisibilityBoost": this.disabledVisibilityBoost && readOnly,
              })}
              value={this.state.value}
              InputLabelProps={{
                className: "label",
              }}
              label={!!label ? formatMessage(intl, module, label) : null}
              onChange={this.dateChange}
              disablePast={disablePast}
              slotProps={slotProps}
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
export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps, null)(openIMISDatePicker))),
);
