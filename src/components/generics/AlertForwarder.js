import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { formatMessage } from "../../helpers/i18n";
import { coreAlert } from "../../actions";

class AlertForwarder extends Component {
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.alert !== this.props.alert && !!this.props.alert) {
            this.props.coreAlert(
                formatMessage(this.props.intl, "core", "FatalError.title"),
                formatMessage(this.props.intl, "core", "FatalError.message"),
                this.props.alert)
        }
    }
    render() {
        return null;
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ coreAlert }, dispatch);
};


export default injectIntl(connect(null, mapDispatchToProps)(AlertForwarder));