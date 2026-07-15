import React, { Component } from "react";
import PropTypes from "prop-types";

export const modulesManagerCtx = React.createContext(null);
// Since we can't reach the frontend package we have to rely on the old context API to get
// the modules manager and propagate it using the new API
export const ModulesManagerProvider = modulesManagerCtx.Provider;

// Mock modulesManager for dev when config empty/no backend
const mockMM = {
  getConf: (module, key, defaultValue = null) => defaultValue,
  getContribs: () => [],
  getMenuEntries: () => [],
  getRoutes: () => ({}),
  getOpenIMISVersion: () => "dev",
  getModulesVersions: () => [],
  hideField: () => false,
  getRef: () => null,
  getReport: () => null,
  getProjection: () => "",
};

export const useModulesManager = () => {
  const value = React.useContext(modulesManagerCtx);
  return value || mockMM;
};

function withModulesManager(C) {
  return (props) => {
    const modulesManager = React.useContext(modulesManagerCtx) || mockMM;
    return <C {...props} modulesManager={modulesManager} />;
  };
}

export default withModulesManager;
