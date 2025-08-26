import React, { Component } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import moment from "moment";
import { injectIntl } from "react-intl";

import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage, toISODate } from "../helpers/i18n";
import { withModulesManager, withHistory } from "@openimis/fe-core";
import { DEFAULT } from "../constants";

import DatePicker from "react-multi-date-picker";
import nepali from "../calendars/NepalCalendar";
import bengali_en from "../calendars/BengaliLocaleEn";
import nepali_en from "../calendars/NepaliLocaleEn";
import nepali_np from "../calendars/NepaliLocaleNp";

import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
  disabledStateVisibilityBoost: {
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
});

function fromISODate(s) {
  if (!s) return null;
  return moment(s).toDate();
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
    this.setState((state, props) => ({ value: props.value || null }));
  }

  componentDidUpdate(prevState, prevProps, snapshot) {
    if (prevState.value !== this.props.value) {
      this.setState((state, props) => ({ value: fromISODate(props.value) }));
    }
  }

  dateChange = (d) => {
    this.setState({ value: toISODate(d) }, (i) => (!!this.props.onChange ? this.props.onChange(toISODate(d)) : null));
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
    "bengali_en": bengali_en,
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
      classes,
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
      secondaryCalendarEnabled,
      secondaryCalendarType,
      secondaryCalendarLocale,
      ...otherProps
    } = this.props;

    if (this.props.secondaryCalendarEnabled || isSecondaryCalendarEnabled) {
      const secondCalendarFormatting = modulesManager.getConf("fe-core", "secondCalendarFormatting", format);
      const secondCalendarType = this.props.secondCalendarType || modulesManager.getConf("fe-core", "secondCalendarType", "nepali");
      const secondCalendarLocale = this.props.secondCalendarLocale || modulesManager.getConf("fe-core", "secondCalendarLocale", "nepali_en");

      return (
        <FormControl fullWidth={fullWidth}>
          <label className={classes.label}>
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
            inputClass="MuiInputBase-input"
            style={{ borderBottom: "1px solid",zIndex:3000 }}
            required={required}
          >
            <button style={{ margin: "5px" }} onClick={(e) => this.clearDate(e)}>
              {formatMessage(intl, module, "calendar.clearButton")}
            </button>
          </DatePicker>
        </FormControl>
      );
    } else {
      return (
        <FormControl fullWidth={fullWidth}>
          <MUIDatePicker
            {...otherProps}
            maxDate={maxDate}
            minDate={minDate}
            format={format}
            disabled={readOnly}
            required={required}
            className={clsx({
              [classes.disabledStateVisibilityBoost]: this.disabledVisibilityBoost && readOnly,
            })}
            clearable
            value={this.state.value}
            InputLabelProps={{
              className: classes.label,
            }}
            label={!!label ? formatMessage(intl, module, label) : null}
            onChange={this.dateChange}
            disablePast={disablePast}
          />
        </FormControl>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  isSecondaryCalendarEnabled: state.core.isSecondaryCalendarEnabled ?? false,
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps, null)(withTheme(withStyles(styles)(openIMISDatePicker))))),
);
