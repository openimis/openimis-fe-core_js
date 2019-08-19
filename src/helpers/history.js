import React, { Component } from "react";
import PropTypes from "prop-types";

function withHistory(C) {
    return class ManagedComponent extends Component {
        static contextTypes = {
            history: PropTypes.object.isRequired,
        }
        render() {
            const { history } = this.context
            return (
                <C {...this.props} history={history} />
            )
        }
    }
}

export default withHistory;

export function historyPush(history, route) {
    history.push(`${process.env.PUBLIC_URL || ""}${route}`);
}