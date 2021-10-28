import { Component } from "react";
import _ from "lodash";

class FormPanel extends Component {
  state = {
    data: {},
  };

  componentDidMount() {
    this.setState((state, props) => ({ data: props.edited }));
  }

  _componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (prevProps.edited_id && !this.props.edited_id) ||
      prevProps.reset !== this.props.reset ||
      !_.isEqual(prevProps.edited, this.props.edited)
    ) {
      this.setState((state, props) => ({ data: props.edited }));
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._componentDidUpdate(prevProps, prevState, snapshot);
  }

  updateAttributes = (updates) => {
    let data = { ...this.state.data, ...updates };
    this.props.onEditedChanged(data);
  };

  updateAttribute = (attr, v) => this.updateAttributes({ [attr]: v });

  getAttributes = () => {
    return this.state.data;
  };

  getAttribute = (attr) => {
    return !!this.state.data[attr] ? this.state.data[attr] : null;
  };

  updateExts = (updates) => {
    let data = { ...this.state.data };
    updates.forEach((update) => {
      data["jsonExt"][update.attr] = update.v;
    });
    this.props.onEditedChanged(data);
  };

  updateExt = (attr, v) => this.updateExts([{ attr: [attr], v }]);
}

export default FormPanel;
