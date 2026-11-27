import { Component } from "react";
import _ from "lodash";

class FormPanel extends Component {
  state = {
    data: {},
  };

  // `data` follows the `edited` prop. It is derived during the render that receives a new
  // `edited`, not set from componentDidUpdate: a setState there costs a nested commit on
  // every keystroke, and React 19 throws "Maximum update depth exceeded" on a burst of them
  // (a barcode scanner, or Cypress typing with no delay).
  static getDerivedStateFromProps(props, state) {
    const prev = state.formPanelProps;
    if (
      !prev ||
      (prev.edited_id && !props.edited_id) ||
      prev.reset !== props.reset ||
      (prev.edited !== props.edited && !_.isEqual(prev.edited, props.edited))
    ) {
      return { data: props.edited, formPanelProps: props };
    }
    return prev === props ? null : { formPanelProps: props };
  }

  _componentDidUpdate(prevProps, prevState, snapshot) {
    // `data` is already up to date (see getDerivedStateFromProps): this only tells
    // subclasses whether it was replaced.
    return (
      (!!prevProps.edited_id && !this.props.edited_id) ||
      prevProps.reset !== this.props.reset ||
      !_.isEqual(prevProps.edited, this.props.edited)
    );
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
