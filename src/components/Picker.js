import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import {
    Dialog, DialogTitle, Divider, Button, DialogActions, DialogContent,
    FormControl, TextField, InputAdornment, IconButton
} from "@material-ui/core";
import { formatMessage } from "../helpers/i18n";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import FormattedMessage from "./FormattedMessage";
import Table from "./Table";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main,
    },
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
});

class RawPickerDialog extends Component {

    keysFunction = event => {
        if (event.keyCode === 27) {
            this.props.onClose();
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keysFunction, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keysFunction, false);
    }

    render() {
        const { classes, open, onClose, onSelect, module, title, close, filter,
            suggestions, suggestionFormatter, count, page, pageSize, onChangePage, onChangeRowsPerPage } = this.props;
        return (
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth="md"
            >
                <DialogTitle className={classes.dialogTitle}>
                    <FormattedMessage module={module} id={title} />
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.dialogContent}>
                    {filter}
                    <Divider />
                    <Table
                        items={suggestions}
                        itemFormatters={[suggestionFormatter]}
                        withPagination={count > pageSize}
                        page={page}
                        pageSize={pageSize}
                        count={count}
                        onChangePage={onChangePage}
                        onChangeRowsPerPage={onChangeRowsPerPage}
                        onDoubleClick={onSelect}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        <FormattedMessage module={module} id={close || "picker.close"} />
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

const PickerDialog = injectIntl(withTheme(withStyles(styles)(RawPickerDialog)))

class Picker extends Component {

    state = {
        open: false
    }

    _onSelect = v => {
        this.setState(
            { open: false },
            this.props.onSelect(v)
        )
    }

    onClose = e => this.setState({ open: false });

    onClear = e => {
        this.setState({
            value: ''
        },
            e => this.props.onChange(null)
        );
    }

    render() {
        const { intl, classes, module, label, dialogTitle, dialogClose, dialogSelect, filter,
            suggestions, suggestionFormatter, count, page, pageSize,
            onChangeRowsPerPage, onChangePage, value, readOnly = false } = this.props;
        return (
            <FormControl fullWidth>
                {!readOnly && (
                    <PickerDialog
                        open={this.state.open}
                        onClose={this.onClose}
                        onSelect={this._onSelect}
                        module={module}
                        title={dialogTitle}
                        close={dialogClose}
                        select={dialogSelect}
                        filter={filter}
                        suggestions={suggestions}
                        suggestionFormatter={suggestionFormatter}
                        count={count}
                        pageSize={pageSize}
                        page={page}
                        onChangeRowsPerPage={onChangeRowsPerPage}
                        onChangePage={onChangePage}
                    />
                )}
                <TextField className={classes.picker}
                    disabled={readOnly}
                    label={formatMessage(intl, module, label)}
                    onClick={e => this.setState({ open: true })}
                    value={suggestionFormatter(value)}
                    InputLabelProps={{
                        className: classes.label
                    }}
                    InputProps={{
                        startAdornment: !readOnly && (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: !readOnly && (
                            <InputAdornment position="end">
                                <IconButton onClick={this.onClear}><ClearIcon /></IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </FormControl>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(Picker)));