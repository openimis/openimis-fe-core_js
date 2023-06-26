import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage, toISODate } from "../helpers/i18n";
import Calendar from '@sbmdkl/nepali-datepicker-reactjs';
import '@sbmdkl/nepali-datepicker-reactjs/dist/index.css';

import {
    withModulesManager,
    withHistory,
  } from "@openimis/fe-core";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

function fromISODate(s) {
  if (!s) return null;
  return moment(s).toDate();
}

class DatePicker extends Component {
  state = { 
    value: null 
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
    this.setState({ value: d }, (i) => this.props.onChange(toISODate(d)));
  };

  onChangeNepal = ({ bsDate, adDate }) => {
		this.setState({ value: toISODate(adDate) });
	};

  render() {
    if (!this.props.isSecondaryCalendarEnabled){
    const {
      intl,
      classes,
      disablePast,
      module,
      label,
      readOnly = false,
      required = false,
      fullWidth = true,
      format = "YYYY-MM-DD",
      reset,
      ...otherProps
    } = this.props;

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
          reset={reset}
          disablePast={disablePast}
        />
      </FormControl>
    );
  }
  else{
    return (
      <Calendar 
        onChange={this.onChangeNepal}
        defaultDate={this.value} 
        language="en"
        theme="deepdark" 
        dateFormat="DDDD, YYYY-MM-DD"
        placeholder="Select date"
      />
    );
  }
  }
}

const mapStateToProps = (state) => ({
    isSecondaryCalendarEnabled: state.core.isSecondaryCalendarEnabled ?? false,
  });

export default injectIntl(
    withModulesManager(
      withHistory(connect(mapStateToProps, {})(withTheme(withStyles(styles)(DatePicker)))),
    ),
  );
  
