import React, { Component } from "react";
import Autosuggest from "react-autosuggest";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormControl, IconButton, InputAdornment, TextField } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import _ from "lodash";

const styles = theme => ({
    paper: {
        margin: theme.spacing(1),
        marginLeft: 0,
    },
    header: theme.table.title,
    label: {
        color: theme.palette.primary.main
    },
    textField: {
        width: "100%",
    },
    suggestionContainer: {
        flexGrow: 1,
        position: "relative",
    },
    suggestionInputField: {
        margin: 0,
        border: 0,
    },
    suggestionsContainerOpen: {
        position: "absolute",
        top: 42,
        padding: 0,
        margin: 0,
        width: "100%",
        backgroundColor: theme.palette.text.second,
        border: "solid 1px grey",
        zIndex: theme.zIndex.modal,
    },
    suggestion: {
        display: "block",
        cursor: "pointer",
        padding: "10px 20px",
    },
    suggestionsList: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
    },
    suggestionHighlighted: {
        color: theme.palette.text.second,
        backgroundColor: theme.palette.text.primary,
    },
});

function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class AutoSuggestion extends Component {

    state = {
        value: '',
        suggestions: []
    }

    componentDidMount() {
        if (!!this.props.value) {
            this.setState({
                value: this.props.getSuggestionValue(this.props.value)
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let items = this.props.items || [];
        if (!_.isEqual(prevState.suggestions, items)) {
            this.setState({
                suggestions: items
            })
        }
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                value: this.props.getSuggestionValue(this.props.value)
            })
        }
    }

    onClear = e => {
        this.setState({
            value: ''
        },
            e => this.props.onSuggestionSelected(null)
        );
    }

    onChange = (event, { newValue, method }) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({ value }) => {
        if (!!this.props.getSuggestions) {
            this.props.getSuggestions(value);
        } else {
            this.setState({
                suggestions: this._getSuggestions(value)
            });
        }
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    _getSuggestions = (value) => {
        if (!this.props.items || !value || !value.trim()) return [];
        const escapedValue = escapeRegexCharacters(value.trim());

        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp(escapedValue, 'gi');
        let lookup = this.props.lookup;
        if (!lookup) {
            lookup = i => this.props.getSuggestionValue(i);
        }
        return this.props.items.filter(i => regex.test(lookup(i)));
    }

    renderInputComponent = (inputProps) => {
        const { classes, withClear } = this.props;
        return (
            <FormControl fullWidth>
                <TextField
                    InputLabelProps={{
                        className: classes.label
                    }}
                    {...inputProps}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={this.onClear}><ClearIcon /></IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </FormControl>
        );
    }

    render() {
        const {
            classes, label, readOnly = false, disabled = false, placeholder,
            getSuggestionValue, onSuggestionSelected
        } = this.props;
        const { suggestions, value } = this.state;
        const inputProps = {
            className: classes.suggestionInputField,
            placeholder,
            value: value,
            label,
            disabled,
            onChange: this.onChange,
        };
        let render = this.props.renderSuggestion
        if (!render) {
            render = s => <span>{getSuggestionValue(s)}</span>
        }
        if (!!readOnly) {
            return (
                <TextField
                    label={label}
                    className={classes.textField}
                    disabled
                    value={value}
                />
            )
        }
        return (
            <Autosuggest
                theme={{
                    container: classes.suggestionContainer,
                    suggestionsContainerOpen: classes.suggestionsContainerOpen,
                    suggestionsList: classes.suggestionsList,
                    suggestion: classes.suggestion,
                    suggestionHighlighted: classes.suggestionHighlighted,
                }}
                renderInputComponent={this.renderInputComponent}
                inputProps={inputProps}
                suggestions={suggestions}
                onSuggestionSelected={(e, i) => onSuggestionSelected(i.suggestion)}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={render}
            />
        )
    }
}

export default withTheme(withStyles(styles)(AutoSuggestion));