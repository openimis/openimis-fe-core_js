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

export function _historyPush(history, route, newTab) {
    if (!!newTab) {
        window.open(`${process.env.PUBLIC_URL || ""}/${toute}}`);
    } else {
        history.push(`${process.env.PUBLIC_URL || ""}${route}`);
    }
}

export function historyPush(mm, history, route, params, newTab = false) {
    _historyPush(history, `/${mm.getRef(route)}${!!params ? "/" + params.join("/"): ""}`, newTab);
}