import React, { Component } from "react";

class FormPanel extends Component {

    state = {
        data: {},
    }

    componentDidMount() {
        this.setState({ data: this.props.edited });
    }

    _componentDidUpdate(prevProps, prevState, snapshot) {
        if ((prevProps.edited_id && !this.props.edited_id) ||
            prevProps.reset !== this.props.reset
        ) {
            this.setState({ data: this.props.edited });
            return true;
        } else if (!_.isEqual(prevProps.edited, this.props.edited)) {
            this.setState({ data: this.props.edited })
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this._componentDidUpdate(prevProps, prevState, snapshot);
    }

    updateAttributes = updates => {
        let data = { ...this.state.data, ...updates };
        this.props.onEditedChanged(data);
    }

    updateAttribute = (attr, v) => this.updateAttributes({ [attr]: v })

}

export default FormPanel
