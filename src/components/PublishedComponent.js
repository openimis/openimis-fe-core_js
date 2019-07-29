import React, { Component } from "react";
import withModulesManager from "../helpers/modules";

class PublishedComponent extends Component {
    render() {
        const { modulesManager, id, ...others } = this.props;
        var C = modulesManager.getComponent(id);
        return !!C ? <C {...others} /> : null;
    }
}

export default withModulesManager(PublishedComponent);