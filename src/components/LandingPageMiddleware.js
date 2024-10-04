import React from "react";
import { Redirect } from "react-router-dom";
import { DEFAULT } from "../constants";
import { useModulesManager } from "../helpers/modules";
import Contributions from "./generics/Contributions";

/**
 * @name LandingPageMiddleware
 * @param {boolean} props.isAuthenticated
 * @returns {React.Component}
 *
 * @description
 * This component is a middleware that checks if the user is authenticated and if the landing page is enabled.
 * If the user is not authenticated, it redirects to the login page.
 * If the user is authenticated, it redirects to the home page.
 * If the landing page is not enabled, it redirects to the home page (if the user is authenticated, otherwise to the login page).
 * If the user is not authenticated and the landing page is enabled, it renders the landing page.
 * To enable the landing page, set the "App.enableLandingPage" configuration to true and
 * add the "core.LandingPage" contribution from any module.
 */

const LANDING_PAGE_CONTRIBUTION_KEY = "core.LandingPage";

const LandingPageMiddleware = ({ isAuthenticated }) => {
  const modulesManager = useModulesManager();
  const enableLandingPage = modulesManager.getConf("fe-core", "App.enableLandingPage", DEFAULT.ENABLE_LANDING_PAGE);

  if (isAuthenticated || !enableLandingPage) {
    return <Redirect to="/home" />;
  }

  return <Contributions contributionKey={LANDING_PAGE_CONTRIBUTION_KEY} isAuthenticated={isAuthenticated} />;
};

export default LandingPageMiddleware;
