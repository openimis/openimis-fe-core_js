import React, { Component } from "react";
import PropTypes from "prop-types";

const modulesManagerCtx = React.createContext(null);
// Since we can't reach the frontend package we have to rely on the old context API to get
// the modules manager and propagate it using the new API
export const ModulesManagerProvider = modulesManagerCtx.Provider;

export const useModulesManager = () => {
  const value = React.useContext(modulesManagerCtx);
  return value;
};

function withModulesManager(C) {
  return class ManagedComponent extends Component {
    static contextTypes = {
      modulesManager: PropTypes.object.isRequired,
    };
    render() {
      const { modulesManager } = this.context;
      return <C {...this.props} modulesManager={modulesManager} />;
    }
  };
}

export default withModulesManager;
