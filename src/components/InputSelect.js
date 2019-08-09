import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class InputSelect extends Component {
    render() {
        const { classes, module, label, name, options, value, onChange } = this.props;
        return (
            <FormControl fullWidth={true}>
                <InputLabel htmlFor={`${module}-${label}`} className={classes.label}>
                    <FormattedMessage module={module} id={label} />
                </InputLabel>
                <Select
                    inputProps={{
                        name: name,
                        id: `${module}-${label}-input`
                    }}
                    value={value || "null"}
                    onChange={e => onChange(e.target.value)}
                >
                    {!!options && options.map((option, idx) =>
                        <MenuItem key={`${module}-${name}-option-${idx}`} value={option.value}>
                            {option.label}
                        </MenuItem>
                    )}
                </Select>
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(InputSelect)));