import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage, toISODate } from "../helpers/i18n";
import { withModulesManager, withHistory } from "@openimis/fe-core";

import nepali from "./NepalCalendar";
import nepali_en from "./NepaliLocale";
import DatePicker from "react-multi-date-picker";

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
      const secondCalendarFormattingLang = modulesManager.getConf("fe-core", "secondCalendarFormattingLang", "en");
      const secondCalendarType = modulesManager.getConf("fe-core", "secondCalendarType", nepali);
      const secondCalendarLocale = modulesManager.getConf("fe-core", "secondCalendarType", nepali_en);

      return (
        <FormControl fullWidth={fullWidth}>
          <label>{!!label ? formatMessage(intl, module, label).concat(required ? "*" : "") : null}</label>
          <DatePicker
            format={secondCalendarFormatting}
            disabled={readOnly}
            // clearable
            value={this.state.value}
            // InputLabelProps={{
            //   className: classes.label,
            // }}
            // reset={reset}
            // minDate={disablePast ? new Date() : null}
            onChange={this.dateChange}
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
