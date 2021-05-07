import React, { Component } from "react";
import moment from "moment";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage, toISODate } from "../helpers/i18n";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    },
});


function fromISODate(s) {
    if (!s) return null;
    return moment(s).toDate();
}

class AdDatePicker extends Component {

    state = { value: null }

    componentDidMount() {
        this.setState((state, props) => ({ value: props.value || null }))
    }

    componentDidUpdate(prevState, prevProps, snapshot) {
        if (prevState.value !== this.props.value) {
            this.setState((state, props) => ({ value: fromISODate(props.value) }))
        }
    }

    dateChange = d => {
        this.setState(
            { value: d },
            i => this.props.onChange(toISODate(d))
        );
    }

    render() {
        const { intl, classes, module, label, readOnly = false, required = false, fullWidth = true, minDate = null, maxDate = null, reset } = this.props;
        //bug in MUIDatePicker!!
        let Picker = null
        if (!!minDate && !!maxDate) {
            Picker = <MUIDatePicker
                format="YYYY-MM-DD"
                disabled={readOnly}
                required={required}
                clearable
                value={this.state.value}
                InputLabelProps={{
                    className: classes.label
                }}
                label={!!label ? formatMessage(intl, module, label) : null}
                onChange={this.dateChange}
                minDate={minDate}
                maxDate={maxDate}
                reset={reset}
            />
        } else if (!!minDate) {
            Picker = <MUIDatePicker
                format="YYYY-MM-DD"
                disabled={readOnly}
                required={required}
                clearable
                value={this.state.value}
                InputLabelProps={{
                    className: classes.label
                }}
                label={!!label ? formatMessage(intl, module, label) : null}
                onChange={this.dateChange}
                minDate={minDate}
                reset={reset}
            />
        } else if (!!maxDate) {
            Picker = <MUIDatePicker
                format="YYYY-MM-DD"
                disabled={readOnly}
                required={required}
                clearable
                value={this.state.value}
                InputLabelProps={{
                    className: classes.label
                }}
                label={!!label ? formatMessage(intl, module, label) : null}
                onChange={this.dateChange}
                maxDate={maxDate}
                reset={reset}
            />
        } else {
            Picker = <MUIDatePicker
                format="YYYY-MM-DD"
                disabled={readOnly}
                required={required}
                clearable
                value={this.state.value}
                InputLabelProps={{
                    className: classes.label
                }}
                label={!!label ? formatMessage(intl, module, label) : null}
                onChange={this.dateChange}
                reset={reset}
            />
        }
        return (
            <FormControl fullWidth={fullWidth}>
                {Picker}
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(AdDatePicker)));
