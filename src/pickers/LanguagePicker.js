import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchLanguages } from "../actions";

class LanguagePicker extends Component {
  componentDidMount() {
    if (!this.props.languages?.length) {
      // prevent loading multiple times the cache when component is several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchLanguages();
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "core", `Language.null`);

  formatSuggestion = (i) => (!!i ? i : this.nullDisplay);

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      languages,
      module = "core",
      withLabel = true,
      label = "LanguagePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false, // , nullLabel = null
    } = this.props;
    let options = !!languages ? languages.map((v) => ({ value: v.code, label: v.name })) : [];
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "core", "LanguagePicker.placehoder") : null}
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  languages: state.core.languages,
  fetching: state.core.fetchingLanguages,
  fetched: state.core.fetchedLanguages,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchLanguages }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(LanguagePicker)));
