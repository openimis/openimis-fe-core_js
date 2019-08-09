import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { FormControl, TextField } from "@material-ui/core";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class InputText extends Component {
    render() {
        const { intl, classes, module, label, value, onChange} = this.props;
        return (
            <FormControl fullWidth={true}>
                <TextField
                    label={formatMessage(intl, module, label)}
                    InputLabelProps={{
                        className: classes.label
                    }}
                    onChange={e => onChange(e.target.value)}
                    defaultValue={value}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(InputText)));