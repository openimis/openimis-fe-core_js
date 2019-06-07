import React, { Component } from "react";
import { Provider } from "react-redux";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { MuiThemeProvider, CssBaseline } from "@material-ui/core";
import theme from "../helpers/theme";
import store from "../helpers/store";
import history from "../helpers/history";
import AppWrapper from "./AppWrapper";
import kebabCase from "lodash/kebabCase";

export const ROUTER_CONTRIBUTION_KEY = "core.Router";

class RootApp extends Component {
  constructor(props) {
    super(props);
    this.routerContributions = props.modulesManager.getContributions(
      ROUTER_CONTRIBUTION_KEY
    );
  }
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <div className="App">
            <CssBaseline />
            <Router history={history}>
              <Switch>
                <Route
                  exact
                  path={`${process.env.PUBLIC_URL || ""}/`}
                  render={() => (
                    <Redirect to={`${process.env.PUBLIC_URL || ""}/home`} />
                  )}
                />
                {this.routerContributions.map((route, index) => {
                  const Comp = route.component;
                  return (
                    <Route
                      exact
                      key={`route_${kebabCase(route.path)}_${index}`}
                      path={`${process.env.PUBLIC_URL || ""}/${route.path}`}
                    >
                      <AppWrapper {...this.props}>
                        <Comp {...this.props} />
                      </AppWrapper>
                    </Route>
                  );
                })}
              </Switch>
            </Router>
          </div>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default RootApp;
