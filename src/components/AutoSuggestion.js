import React, { Component } from "react";
import Autosuggest from "react-autosuggest";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormControl, Input, InputAdornment, TextField } from "@material-ui/core";
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
    suggestionContainer: {
        flexGrow: 1,
        position: "relative",
    },
    suggestionInputField: {
        margin: 10,
        border: 0,
    },
    suggestionsContainerOpen: {
        position: "absolute",
        top: 42,
        padding: 0,
        margin: 0,
        width: "100%",
        backgroundColor: theme.palette.text.secondary,
        border: "solid 1px grey"
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
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.text.primary,
    },
});

function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class AutoSuggestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || '',
            suggestions: []
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let items = this.props.items || [];
        if (!_.isEqual(prevState.suggestions, items)) {
            this.setState({
                suggestions: items
            })
        }
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
        return this.props.items.filter(i => regex.test(this.props.lookup(i)));
    }

    renderInputComponent = (inputProps) => {
        const { classes } = this.props;
        return (
            <FormControl fullWidth>
                <TextField
                    InputLabelProps={{
                        className: classes.label
                    }}
                    {...inputProps}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                    }}
                />
            </FormControl>
        );
    }

    render() {
        const { classes, label, placeholder, getSuggestionValue, renderSuggestion, onSuggestionSelected } = this.props;
        const { suggestions, value } = this.state;
        const inputProps = {
            className: classes.suggestionInputField,
            placeholder,
            value,
            label,
            onChange: this.onChange
        };
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
                renderSuggestion={renderSuggestion}
            />
        )
    }
}

export default withTheme(withStyles(styles)(AutoSuggestion));