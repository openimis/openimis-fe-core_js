import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
import TextInput from "./TextInput";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main,
    }
});

class SelectInput extends Component {

    _onChange = e => {
        if (this.props.value !== e.target.value) {
            this.props.onChange(e.target.value)
        }
    }

    render() {
        const { classes, module, label, name, options, value, disabled = false, readOnly = false } = this.props;
        let valueStr = options.filter(o => o.value === value).map(o => o.label);
        return (
            <Fragment>
                {!readOnly && (

                    <FormControl fullWidth>
                        {!!label && (
                            <InputLabel className={classes.label}>
                                <FormattedMessage module={module} id={label} />
                            </InputLabel>
                        )}
                        <Select
                            readOnly={readOnly}
                            inputProps={{
                                name: name,
                                id: `${module}-${label}-input`
                            }}
                            value={value || "null"}
                            onChange={this._onChange}
                            disabled={disabled}
                        >
                            {!!options && options.map((option, idx) =>
                                <MenuItem key={`${module}-${name}-option-${idx}`} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                )}
                {!!readOnly && (
                    <TextInput
                        module={module}
                        label={label}
                        value={valueStr}
                        readOnly={true}
                    />
                )}
            </Fragment>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(SelectInput)));