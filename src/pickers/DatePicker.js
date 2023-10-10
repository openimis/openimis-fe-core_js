import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage, toISODate } from "../helpers/i18n";
import { withModulesManager, withHistory } from "@openimis/fe-core";

import nepali from "../calendars/NepalCalendar";
import nepali_en from "../calendars/NepaliLocaleEn";
import nepali_np from "../calendars/NepaliLocaleNp";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/mobile.css"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import persian_en from "react-date-object/locales/persian_fa"
import arabic from "react-date-object/calendars/arabic"
import arabic_ar from "react-date-object/locales/arabic_ar"
import arabic_en from "react-date-object/locales/arabic_en"
import indian from "react-date-object/calendars/indian"
import indian_hi from "react-date-object/locales/indian_hi"

import gregorian from "react-date-object/calendars/gregorian"
import indian_en from "react-date-object/locales/gregorian_en"

import jalali from "react-date-object/calendars/jalali"
import DateObject from "react-date-object";


const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

function fromISODate(s) {
  if (!s) return null;
  return moment(s).toDate();
}

class openIMISDatePicker extends Component {
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
    this.setState({ value: toISODate(d.toDate()) }, (i) => (!!this.props.onChange ? this.props.onChange(toISODate(d.toDate())) : null));
  };

  clearDate = (e) =>{
    e.preventDefault();
    this.setState({value:null});
  }

  getMinDate = (_minDate, _disablePast) => {
    let result = _minDate;

    if (_disablePast && (new Date() > _minDate)){
      result = new Date()
    }

    return result
  }

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
      ...otherProps
    } = this.props;

    if (isSecondaryCalendarEnabled) {
      const secondCalendarFormatting = modulesManager.getConf("fe-core", "secondCalendarFormatting", format);
      const secondCalendarType = modulesManager.getConf("fe-core", "secondCalendarType", nepali);
      const secondCalendarLocale = modulesManager.getConf("fe-core", "secondCalendarType", nepali_en);

      return (
        <FormControl fullWidth={fullWidth}>
          <label className={classes.label}>{!!label ? formatMessage(intl, module, label).concat(required ? " *" : "") : null}</label>
          <DatePicker
            format={secondCalendarFormatting}
            disabled={readOnly}
            value={this.state.value ? new Date(this.state.value) : null}
            {...((!!this.props.minDate || !!disablePast) && {minDate: this.getMinDate(this.props.minDate, disablePast)})}
            {...(!!this.props.maxDate && {maxDate: this.props.maxDate})}
            onChange={this.secondaryCalendarDateChange}
            highlightToday={false}
            className="rmdp-mobile"
            mobileButtons={[
              {
                label: formatMessage(intl, "core", "calendar.clearButton"),
                type: "button",
                className: "rmdp-button rmdp-action-button",
                onClick: (e) => this.clearDate(e),
              },
            ]}
            mobileLabels={{
              OK: formatMessage(intl, "core", "calendar.okButton"),
              CANCEL: formatMessage(intl, "core", "calendar.cancelButton"),
            }}
            calendar={secondCalendarType}
            locale={secondCalendarLocale}
          />
        </FormControl>
      );
    } else {
      return (
        <FormControl fullWidth={fullWidth}>
          <MUIDatePicker
            {...otherProps}
            format={format}
            disabled={readOnly}
            required={required}
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
