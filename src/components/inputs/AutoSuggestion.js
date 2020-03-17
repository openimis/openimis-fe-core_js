import React, { Component } from "react";
import Autosuggest from "react-autosuggest";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormControl, IconButton, InputAdornment, TextField } from "@material-ui/core";
import SelectInput from "./SelectInput";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import withModulesManager from "../../helpers/modules";
import { injectIntl } from 'react-intl';
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

const INIT_STATE = {
    value: '',
    suggestions: [],
    selected: null,
}

const MORE = "__THE_MORE_FAKE_OPTION__";

class AutoSuggestion extends Component {

    constructor(props) {
        super(props);
        this.limitDisplay = props.modulesManager.getConf("fe-core", "AutoSuggestion.limitDisplay", 10);
    }

    state = INIT_STATE;

    _allItems = () => {
        var items = [...(this.props.items || [])]
        items.unshift(...(this.props.preValues || []))
        return items
    }

    componentDidMount() {
        if (!!this.props.value) {
            this.setState({
                value: this.props.getSuggestionValue(this.props.value),
                selected: this.props.getSuggestionValue(this.props.value),
                suggestions: this._truncate(this._allItems())
            })
        }
        if (!!this.props.items) {
            this.setState({
                suggestions: this._truncate(this._allItems())
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset) {
            this.setState({
                suggestions: this._truncate(this._allItems()),
                value: this.props.getSuggestionValue(this.props.value),
                selected: this.props.getSuggestionValue(this.props.value),
            });
        } else {
            if (!_.isEqual(prevProps.value, this.props.value)) {
                this.setState({
                    suggestions: !this.props.value ? this._truncate(this._allItems()) : [],
                    value: this.props.getSuggestionValue(this.props.value),
                    selected: this.props.getSuggestionValue(this.props.value),
                })
            } else if (!_.isEqual(prevProps.items, this.props.items)) {
                this.setState({
                    suggestions: this._truncate(this._allItems())
                })
            }
        }
    }

    onClear = e => {
        this.setState({
            value: '',
            selected: null
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
                suggestions: this._getSuggestions(value),
            });
        }
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    _truncate = (suggestions) => {
        if (this.limitDisplay > 0 && suggestions.length > this.limitDisplay) {
            suggestions = suggestions.slice(0, this.limitDisplay);
            suggestions.push(MORE);
        }
        return suggestions
    }

    _getSuggestions = (value) => {
        if (!value || !value.trim()) return [];
        const escapedValue = escapeRegexCharacters(value.trim());

        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp(escapedValue, 'i');
        let lookup = this.props.lookup;
        if (!lookup) {
            lookup = i => this.props.getSuggestionValue(i);
        }
        return this._truncate(this._allItems().filter(i => regex.test(lookup(i))));
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

    _shouldRenderSuggestions = () => {
        return this.state.value !== this.state.selected;
    }

    _onSuggestionSelected = (e, i) => {
        this.setState(
            { selected: this.props.getSuggestionValue(i.suggestion) },
            e => this.props.onSuggestionSelected(i.suggestion)
        )
    }

    _onOptionSelected = (o) => {
        this.setState(
            { selected: o },
            e => this.props.onSuggestionSelected(o)
        )
    }

    _render = (s) => {
        let styleCover = {
            marginTop: "-10px",
            marginBottom: "-10px",
            marginLeft: "-20px",
            marginRight: "-20px",
        }
        let styleRevert = {
            marginTop: "10px",
            marginBottom: "10px",
            marginLeft: "20px",
            marginRight: "20px",
        }

        if (s === MORE) {
            return (
                <div
                    style={styleCover}
                    onClick={(e) => e.stopPropagation()}>
                    <span
                        style={styleRevert}
                        onClick={(e) => e.stopPropagation()}>
                        {this.props.intl.formatMessage({ id: "autosuggest.more" })}
                    </span>
                </div>
            )
        }
        let render = this.props.renderSuggestion
        if (!render) {
            render = s => <span>{this.props.getSuggestionValue(s)}</span>
        }
        return render(s);
    }

    renderSelect = () => {
        const {
            module, withNull, nullLabel, label, required = false, getSuggestionValue } = this.props;
        const { suggestions, selected } = this.state;
        var options = suggestions.map(r => ({ value: r, label: getSuggestionValue(r) }));
        if (withNull) {
            options.unshift({ value: null, label: nullLabel })
        }
        return <SelectInput
            module={module}
            strLabel={label}
            options={options}
            value={selected}
            onChange={this._onOptionSelected}
            required={required}
        />
    }

    renderAutoselect = () => {
        const {
            classes, label, disabled = false, required = false,
            placeholder, getSuggestionValue
        } = this.props;
        const { suggestions, value } = this.state;
        const inputProps = {
            className: classes.suggestionInputField,
            placeholder,
            value: value,
            label,
            disabled,
            onChange: this.onChange,
            required,
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
                onSuggestionSelected={this._onSuggestionSelected}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={this._render}
                shouldRenderSuggestions={this._shouldRenderSuggestions}
            />
        )
    }

    render() {
        const {
            classes, label, readOnly = false, selectThreshold = null
        } = this.props;
        const { value, suggestions } = this.state;
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
        if (!value && !!selectThreshold &&
            !!suggestions &&
            suggestions.length > 0 &&
            suggestions.length < selectThreshold
        ) {
            return this.renderSelect();
        } else {
            return this.renderAutoselect();
        }
    }
}

export default injectIntl(withModulesManager(withTheme(withStyles(styles)(AutoSuggestion))));