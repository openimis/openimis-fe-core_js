import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { TextField, FormControl } from "@material-ui/core";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
});

class NumberInput extends Component {
    state = {
        value: ""
    }
    componentDidMount() {
        this.setState({ value: this.props.value || "" })
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.value !== this.props.value) {
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
        const { intl, module, label } = this.props;
        return (
            <FormControl fullWidth={true}>
                <TextField
                    label={!!label && formatMessage(intl, module, label)}
                    value={this.state.value}
                    type="number"
                    onChange={this._onChange}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(NumberInput)));