import React from "react";
import { Redirect } from "react-router-dom";

import { DEFAULT } from "../constants";
import { useModulesManager } from "../helpers/modules";
import Contributions from "./generics/Contributions";

/**
 * @name PublicPageMiddleware
 * @param {boolean} props.isAuthenticated
 * @returns {React.Component}
 *
 * @description
 * This component is a middleware that checks if the user is authenticated and if the public page is enabled.
 * If the user is not authenticated, it redirects to the login page.
 * If the user is authenticated, it redirects to the home page.
 * If the public page is not enabled, it redirects to the home page (if the user is authenticated, otherwise to the login page).
 * If the user is not authenticated and the public page is enabled, it renders the public page.
 * To enable the public page, set the "App.enablePublicPage" configuration to true and
 * add the "core.PublicPage" contribution from any module.
 */

const PUBLIC_PAGE_CONTRIBUTION_KEY = "core.PublicPage";

const PublicPageMiddleware = ({ isAuthenticated, logo }) => {
  const modulesManager = useModulesManager();
  const enablePublicPage = modulesManager.getConf("fe-core", "App.enablePublicPage", DEFAULT.ENABLE_PUBLIC_PAGE);

  if (isAuthenticated || !enablePublicPage) {
    return <Redirect to="/home" />;
  }

  return <Contributions contributionKey={PUBLIC_PAGE_CONTRIBUTION_KEY} isAuthenticated={isAuthenticated} logo={logo} />;
};

export default PublicPageMiddleware;
