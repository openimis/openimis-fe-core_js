import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import Autosuggest from "react-autosuggest";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormControl, Input, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import formatMessage from "../helpers/i18n";
import _ from "lodash";

const styles = theme => ({
    paper: {
        margin: theme.spacing(1),
        marginLeft: 0,
    },
    header: theme.table.title,
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

function renderInputComponent(inputProps) {
    return (
        <FormControl fullWidth>
            <Input
                {...inputProps}
                startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
            />
        </FormControl>
    );
}


class AutoSuggestion extends Component {
    constructor() {
        super();

        this.state = {
            value: '',
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

    _getSuggestions(value) {
        const escapedValue = escapeRegexCharacters(value.trim());

        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp(escapedValue, 'gi');
        return this.props.items.filter(i => regex.test(this.props.lookup(i)));
    }

    render() {
        const { intl, classes, getSuggestionValue, renderSuggestion, onSuggestionSelected } = this.props;
        const { value, suggestions } = this.state;
        const inputProps = {
            className: classes.suggestionInputField,
            placeholder: formatMessage(intl, "policy", "insureeEligibility.service.search"),
            value,
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
                inputProps={inputProps}
                suggestions={suggestions}
                onSuggestionSelected={(e,i) => onSuggestionSelected(i.suggestion)}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                renderInputComponent={renderInputComponent}
            />
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(AutoSuggestion)));