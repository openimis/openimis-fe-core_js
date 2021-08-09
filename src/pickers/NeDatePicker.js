import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { FormControl, TextField, IconButton, Grid } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import { formatMessage, toISODate } from "../helpers/i18n";
import { formatDateFromISO } from "./NeDateFormatter";
import withModulesManager from "../helpers/modules.js";

class NeDatePicker extends Component {
  state = { isoValue: null, strValue: "" };

  componentDidMount() {
    this.$el = $(this.el);
    $(this.$el).nepaliDatePicker({
      dateFormat: "%y-%m-%d",
      closeOnDateSelect: true,
    });
    this.setState((state, props) => ({
      isoValue: props.value,
      strValue: formatDateFromISO(props.value),
    }));
    this.$el.on("dateSelect", this.dateChange);
  }

  componentDidUpdate(prevState, prevProps, snapshot) {
    if (prevState.value !== this.props.value) {
      this.setState((state, props) => ({
        isoValue: props.value,
        strValue: formatDateFromISO(props.value),
      }));
    }
  }

  componentWillUnmount() {
    this.$el.off("dateSelect", this.dateChange);
  }

  dateChange = (e) => {
    this.setState(
      {
        isoValue: toISODate(e.datePickerData.adDate),
        strValue: e.datePickerData.formattedDate,
      },
      (i) => this.props.onChange(this.state.isoValue)
    );
  };

  clear = (e) => {
    this.setState(
      {
        isoValue: null,
        strValue: "",
      },
      (i) => this.props.onChange(null)
    );
  };

  render() {
    const { intl, module, label, readOnly = false, required = false, fullWidth = true } = this.props;
    return (
      <FormControl fullWidth={fullWidth}>
        <Grid container direction="row" alignItems="center" alignContent="center">
          <Grid item xs={10}>
            <TextField
              value={this.state.strValue}
              readOnly={readOnly}
              required={required}
              label={!!label ? formatMessage(intl, module, label) : null}
              ref={(el) => (this.el = el)}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={this.clear}>
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

export default withModulesManager(injectIntl(NeDatePicker));
