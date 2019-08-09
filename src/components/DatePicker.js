import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    },
});

class DatePicker extends Component {

    dateChange = e => {
        this.props.onChange(e.toDate())
    }

    render() {
        const { intl, classes, module, label } = this.props;
        return (<KeyboardDatePicker
            InputLabelProps={{
                className: classes.label
            }}
            margin="normal"
            id={`${module}-${label}-date-picker`}
            label={formatMessage(intl, module, label)}
            onChange={this.dateChange}
        />)
    }
}

export default injectIntl(withTheme(withStyles(styles)(DatePicker)));
