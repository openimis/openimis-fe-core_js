import React, { Component } from "react";
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

class DatePicker extends Component {

    state = { value: null }

    componentDidMount() {
        this.setState({ value: this.props.value })
    }

    componentDidUpdate(prevState, prevProps, snapshot) {
        if (prevState.value !== this.props.value) {
            this.setState({ value: this.props.value })
        }
    }

    dateChange = e => {
        this.setState(
            { value: e },
            i => this.props.onChange(!!e ? e.toArray().slice(0,3).join('-') : null)
        );
    }

    render() {
        const { intl, classes, module, label } = this.props;
        return (
            <FormControl fullWidth>
                <MUIDatePicker
                    format="YYYY-MM-DD"
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

export default injectIntl(withTheme(withStyles(styles)(DatePicker)));
