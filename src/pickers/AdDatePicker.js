import React, { Component } from "react";
import moment from "moment";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { FormControl } from "@material-ui/core";
import { DatePicker as MUIDatePicker } from "@material-ui/pickers";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    },
});


function fromISODate(s) {
    if (!s) return null;
    return moment(s).toDate();
}

function toISODate(d) {
    if (!d) return null;
    const a = d.toArray().slice(0, 3);
    a[0] = ('0000' + a[0]).slice(-4);
    a[1] = ('00' + (a[1] + 1)).slice(-2);
    a[2] = ('00' + a[2]).slice(-2);
    return a.join('-');
}

class AdDatePicker extends Component {

    state = { value: null }

    componentDidMount() {
        this.setState({ value: this.props.value })
    }

    componentDidUpdate(prevState, prevProps, snapshot) {
        if (prevState.value !== this.props.value) {
            this.setState({ value: fromISODate(this.props.value) })
        }
    }

    dateChange = d => {
        this.setState(
            { value: d },
            i => this.props.onChange(toISODate(d))
        );
    }

    render() {
        const { intl, classes, module, label, readOnly = false, fullWidth = true } = this.props;
        return (
            <FormControl fullWidth={fullWidth}>
                <MUIDatePicker
                    format="YYYY-MM-DD"
                    disabled={readOnly}
                    clearable
                    value={this.state.value}
                    InputLabelProps={{
                        className: classes.label
                    }}
                    id={`${module}-${label}-date-picker`}
                    label={!!label ? formatMessage(intl, module, label) : null}
                    onChange={this.dateChange}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(AdDatePicker)));
