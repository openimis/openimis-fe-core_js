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

class TextInput extends Component {
    state = {
        value: ""
    }
    componentDidMount() {
        this.setState({ value: this.props.value || "" })
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset || prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value || "" })
        }
    }
    _onChange = e => {
        this.setState(
            { value: e.target.value },
            e => this.props.onChange(this.state.value)
        );
    }
    render() {
        const { intl, classes, module, label, autofocus = false, inputProps, readOnly = false,
            startAdornment = null, endAdornment = null, onClick, required = false, error = null } = this.props;
        return (
            <FormControl fullWidth={true}>
                <TextField
                    disabled={readOnly}
                    required={required}
                    autoFocus={autofocus}
                    label={!!label && formatMessage(intl, module, label)}
                    InputLabelProps={{
                        className: classes.label
                    }}
                    InputProps={{ startAdornment, endAdornment }}
                    inputProps={inputProps}
                    onChange={this._onChange}
                    value={this.state.value}
                    onClick={onClick}
                    error={!!error}
                    helperText={error}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(TextInput)));