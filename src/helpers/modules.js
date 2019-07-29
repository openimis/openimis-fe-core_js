import React, { Component } from "react";
import PropTypes from "prop-types";

function withModulesManager(C) {
    return class ManagedComponent extends Component {
        static contextTypes = {
            modulesManager: PropTypes.object.isRequired,
        }
        render() {
            const { modulesManager } = this.context
            return (
                <C {...this.props} modulesManager={modulesManager} />
            )
        }
    }
}

export default withModulesManager;
