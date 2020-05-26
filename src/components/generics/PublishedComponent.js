import React, { Component } from "react";
import withModulesManager from "../../helpers/modules";

class PublishedComponent extends Component {
    render() {
        // id kept for backward (< 1.2) compatibility,
        // but prefer using pubRef to prevent any conflict with React default id property
        const { modulesManager, id, pubRef, ...others } = this.props;
        var C = modulesManager.getRef(id || pubRef);
        return !!C ? <C {...others} /> : null;
    }
}

export default withModulesManager(PublishedComponent);