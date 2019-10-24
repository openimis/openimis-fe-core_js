import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { TextField, InputAdornment, FormControl } from "@material-ui/core";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
});

class AmountInput extends Component {
    state = {
        value: ""
    }

    setValue() {
        var value = this.props.value;
        if (!value && this.props.value !== 0) {
            value = "";
        }
        this.setState({ value })
    }
    componentDidMount() {
        this.setValue();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.value !== this.props.value) {
            this.setValue();
        }
    }
    _onChange = e => {
        this.setState(
            { value: e.target.value },
            e => this.props.onChange(this.state.value)
        );
    }
    render() {
        const { intl, module, label, readOnly = false } = this.props;
        return (
            <FormControl fullWidth={true}>
                <TextField
                    disabled={readOnly}
                    label={!!label && formatMessage(intl, module, label)}
                    value={this.state.value}
                    type="number"
                    onChange={this._onChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">{intl.formatMessage({ id: "currency" })}</InputAdornment>,
                    }}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(AmountInput)));