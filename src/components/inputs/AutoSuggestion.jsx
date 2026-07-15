import React, { Component } from "react";
import { styled } from "@mui/material/styles";
import { FormControl, IconButton, InputAdornment, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import SelectInput from "./SelectInput";
import GetIconComponent from "../../helpers/icons";

const ClearIcon = GetIconComponent("Clear");
const SearchIcon = GetIconComponent("Search");
import withModulesManager from "../../helpers/modules";
import { injectIntl } from "react-intl";
import _ from "lodash";

const StyledAutoSuggestion = styled("div")(({ theme }) => ({
  "& .paper": {
    margin: theme.spacing(1),
    marginLeft: 0,
  },
  "& .header": {
    fontWeight: 500,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
  },
  "& .label": {
    color: theme.palette.primary.main,
  },
  "& .textField": {
    width: "100%",
    minWidth: "120px",
  },
  "& .suggestionContainer": {
    flexGrow: 1,
    position: "relative",
    width: "100%",
    minWidth: "120px",
  },
  "& .suggestionInputField": {
    margin: 0,
    border: 0,
  },
  "& .suggestion": {
    display: "block",
    cursor: "pointer",
    padding: theme.spacing(1, 2),
  },
  "& .suggestionsList": {
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  "& .suggestionHighlighted": {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.selected,
  },
}));

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const INIT_STATE = {
  value: "",
  suggestions: [],
  selected: "",
};

const MORE = "__THE_MORE_FAKE_OPTION__";

class AutoSuggestion extends Component {
  constructor(props) {
    super(props);
    this.limitDisplay = props.modulesManager.getConf("fe-core", "AutoSuggestion.limitDisplay", 10);
  }

  state = INIT_STATE;

  _allItems = () => {
    const { preValues, items } = this.props;
    return [...(preValues ?? []), ...(items ?? [])];
  };

  componentDidMount() {
    if (this.props.value) {
      this.setState((state, props) => ({
        value: props.getSuggestionValue(props.value),
        selected: props.getSuggestionValue(props.value),
        suggestions: this._truncate(this._allItems()),
      }));
    }
    if (this.props.items) {
      this.setState({
        suggestions: this._truncate(this._allItems()),
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset) {
      this.setState((state, props) => ({
        suggestions: this._truncate(this._allItems()),
        value: props.value ? props.getSuggestionValue(props.value) : "",
        selected: props.value ? props.getSuggestionValue(props.value) : "",
      }));
    } else if (!_.isEqual(prevProps.value, this.props.value)) {
      this.setState((state, props) => ({
        suggestions: this._truncate(this._allItems()),
        value: props.value ? props.getSuggestionValue(props.value) : "",
        selected: props.value ? props.getSuggestionValue(props.value) : "",
      }));
    } else if (!_.isEqual(prevProps.items, this.props.items)) {
      this.setState({
        suggestions: this._truncate(this._allItems()),
      });
    }
  }

  onClear = () => {
    this.setState(
      {
        value: "",
        selected: "",
      },
      () => (this.props.onClear ? this.props.onClear() : this.props.onSuggestionSelected(null)),
    );
  };

  onChange = (event, { newValue }) => {
    this.setState({ value: newValue });
  };

  onInputChange = (event, { newValue }) => {
    this.setState({ value: newValue });
    if (this.props.getSuggestions) {
      this.props.getSuggestions(newValue);
    } else {
      this.setState({
        suggestions: this._getSuggestions(newValue),
      });
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    if (this.props.getSuggestions) {
      this.props.getSuggestions(value);
    } else {
      this.setState({
        suggestions: this._getSuggestions(value),
      });
    }
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: this._truncate(this._allItems()),
    });
  };

  _truncate = (suggestions) => {
    if (this.limitDisplay > 0 && suggestions.length > this.limitDisplay) {
      suggestions = suggestions.slice(0, this.limitDisplay);
      suggestions.push(MORE);
    }
    return suggestions;
  };

  _getSuggestions = (value) => {
    if (!value || !value.trim()) {
      return this._truncate(this._allItems());
    }
    const escapedValue = escapeRegexCharacters(value.trim());
    if (escapedValue === "") {
      return [];
    }
    const regex = new RegExp(escapedValue, "i");
    let lookup = this.props.lookup;
    if (!lookup) {
      lookup = (i) => this.props.getSuggestionValue(i);
    }
    return this._truncate(this._allItems().filter((i) => regex.test(lookup(i))));
  };

  renderInputComponent = ({ inputRef, ...inputProps }) => {
    const { label } = this.props;
    return (
      <FormControl fullWidth>
        <TextField
          {...inputProps}
          label={label}
          InputLabelProps={{
            ...inputProps.InputLabelProps,
            className: "label",
          }}
          inputRef={inputRef}
          InputProps={{
            ...inputProps.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={this.onClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>
    );
  };

  _shouldRenderSuggestions = (value) => {
    return value !== this.state.selected;
  };

  onSuggestionSelected = (event, { newValue }) => {
    this.setState(
      (state, props) => ({
        selected: props.getSuggestionValue(newValue),
      }),
      () => this.props.onSuggestionSelected(newValue),
    );
  };

  onOptionSelected = (selected) => {
    this.setState({ selected }, () => this.props.onSuggestionSelected(selected));
  };

  _renderSuggestion = (suggestion, { isHighlighted }) => {
    let styleCover = {
      marginTop: "-10px",
      marginBottom: "-10px",
      marginLeft: "-20px",
      marginRight: "-20px",
    };
    let styleRevert = {
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "20px",
      marginRight: "20px",
    };
    if (suggestion === MORE) {
      return (
        <div style={styleCover} onClick={(e) => e.stopPropagation()}>
          <span style={styleRevert} onClick={(e) => e.stopPropagation()}>
            {this.props.intl.formatMessage({ id: "autosuggest.more" })}
          </span>
        </div>
      );
    }
    let render = this.props.renderSuggestion;
    if (!render) {
      render = (s) => <span>{this.props.getSuggestionValue(s)}</span>;
    }
    return <div className={isHighlighted ? "suggestionHighlighted" : "suggestion"}>{render(suggestion)}</div>;
  };

  renderSelect = () => {
    const { module, withNull, nullLabel, label, required = false, getSuggestionValue, title } = this.props;
    const { suggestions, selected } = this.state;
    var options = suggestions.map((r) => ({ value: r, label: getSuggestionValue(r) }));
    if (withNull) {
      options.unshift({ value: null, label: nullLabel });
    }
    return (
      <SelectInput
        module={module}
        strLabel={label}
        options={options}
        value={selected}
        onChange={this.onOptionSelected}
        required={required}
        title={title}
      />
    );
  };

  renderAutoselect = () => {
    const { label, disabled = false, required = false, placeholder, getSuggestionValue, title = "" } = this.props;
    const { suggestions, value } = this.state;

    return (
      <Autocomplete
        className="suggestionContainer"
        fullWidth
        options={suggestions}
        getOptionLabel={(option) => {
          if (typeof option === "string") return option;
          return option ? getSuggestionValue(option) : "";
        }}
        value={value || ""}
        onChange={(event, newValue) => this.onSuggestionSelected(event, { newValue })}
        onInputChange={(event, newValue) => this.onInputChange(event, { newValue })}
        filterOptions={(options) => options} // Custom filtering handled by _getSuggestions
        renderInput={(params) => this.renderInputComponent(params)}
        renderOption={(props, option, { selected }) => (
          <li {...props} className={selected ? "suggestionHighlighted" : "suggestion"}>
            {this._renderSuggestion(option, { isHighlighted: selected })}
          </li>
        )}
        open={this._shouldRenderSuggestions(value)}
        onOpen={() => this.onSuggestionsFetchRequested({ value })}
        onClose={() => this.onSuggestionsClearRequested()}
        disableClearable={true} // Handled by custom clear button
        disabled={disabled}
        ListboxProps={{ className: "suggestionsList" }}
        freeSolo
        inputValue={value || ""}
        renderTags={() => null} // Disable tags for single selection
        {...{ title }}
      />
    );
  };

  render() {
    const { label, readOnly = false, selectThreshold = null, title = "" } = this.props;
    const { value, suggestions } = this.state;

    if (readOnly) {
      return (
        <StyledAutoSuggestion>
          <TextField label={label} className="textField" disabled value={value || ""} title={title} />
        </StyledAutoSuggestion>
      );
    }

    if (!value && selectThreshold && suggestions && suggestions.length > 0 && suggestions.length < selectThreshold) {
      return this.renderSelect();
    } else {
      return <StyledAutoSuggestion>{this.renderAutoselect()}</StyledAutoSuggestion>;
    }
  }
}

export { StyledAutoSuggestion };
export default injectIntl(withModulesManager(AutoSuggestion));
