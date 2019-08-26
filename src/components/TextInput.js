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
        this.setState({ value: !this.props.value ? "" : this.props.value })
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: !this.props.value ? "" : this.props.value })
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
            startAdornment = null, endAdornment = null } = this.props;
        return (
            <FormControl fullWidth={true}>
                <TextField
                    readOnly={readOnly}
                    autoFocus={autofocus}
                    label={!!label && formatMessage(intl, module, label)}
                    InputLabelProps={{
                        className: classes.label
                    }}
                    InputProps={{ startAdornment, endAdornment }}
                    inputProps={inputProps}
                    onChange={this._onChange}
                    value={this.state.value}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(TextInput)));