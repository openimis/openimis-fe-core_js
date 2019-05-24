import React, { Component } from "react";
import CoreApp from "./components/CoreApp";
import Contributions from "./components/Contributions";
import MainMenuContribution from "./components/MainMenuContribution";
import MainSearcher from "./components/MainSearcher";
import HomePage from "./components/HomePage";
import ProxyPage from "./components/ProxyPage";

export const APP_BAR_CONTRIBUTION_KEY = "core.AppBar";
export const MAIN_MENU_CONTRIBUTION_KEY = "core.MainMenu";
export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const MAIN_SEARCHER_CONTRIBUTION_KEY = "core.MainSearcher";

export const DRAWER_WIDTH = 240;

export default class CoreModule extends Component {
  static contributions = {
    "core.Router": [
      { path: "home", component: HomePage }
    ],
    "core.AppBar": [MainSearcher]
  };
}

export { CoreApp, Contributions, MainMenuContribution, ProxyPage };