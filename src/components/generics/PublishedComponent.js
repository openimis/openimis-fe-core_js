import React, { Component } from "react";
import withModulesManager from "../../helpers/modules";

class PublishedComponent extends Component {
    render() {
        const { modulesManager, pubId, ...others } = this.props;
        var C = modulesManager.getRef(pubId);
        return !!C ? <C {...others} /> : null;
    }
}

export default withModulesManager(PublishedComponent);