import React, { Component }  from "react";
import PropTypes from "prop-types";

export const withModulesManager = (ComponentToWrap) => {
    return class ManagedComponent extends Component {
        static contextTypes = {
            modulesManager: PropTypes.object.isRequired,
        }
        render() {
            const { modulesManager } = this.context
            return (
                <ComponentToWrap {...this.props} modulesManager={modulesManager} />
            )
        }
    }
}
