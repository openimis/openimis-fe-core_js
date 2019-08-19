import React, { Component } from "react";
import { connect } from "react-redux";
import { IntlProvider } from 'react-intl';
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { CssBaseline, CircularProgress } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import withHistory from "../helpers/history";
import withModulesManager from "../helpers/modules";
import AppWrapper from "./AppWrapper";
import FatalError from './FatalError';
import kebabCase from "lodash/kebabCase";
import { auth } from "../actions";

export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const TRANSLATION_CONTRIBUTION_KEY = "translations";

const styles = theme => ({
  fetching: {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});

class RootApp extends Component {

  constructor(props) {
    super(props);
    this.routerContributions = props.modulesManager.getContribs(
      ROUTER_CONTRIBUTION_KEY
    );
  }

  componentDidMount() {
    this.props.auth();
  }

  buildMessages(messages, lang) {
    var msgs = this.props.modulesManager
      .getContribs(TRANSLATION_CONTRIBUTION_KEY)
      .filter(msgs => msgs.key === lang)
      .reduce((allmsgs, msgs) => Object.assign(allmsgs, msgs.messages), {})
    return { ...messages, ...msgs };
  }

  render() {
    const { history, classes, error, user, messages, ...others } = this.props;
    if (error) {
      return <FatalError error={error} />;
    }

    if (!user) {
      return (
        <div>
          <CircularProgress className={classes.fetching} />
        </div>
      );
    } else {
      return (
        <IntlProvider
          locale={this.props.localesManager.getLocale(user.language)}
          messages={this.buildMessages(messages, user.language)}
        >
          <div className="App">
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
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
                      render={props => (
                        <AppWrapper {...props} {...others}>
                          <Comp {...props} {...others} />
                        </AppWrapper>
                      )}
                    />
                  );
                })}
              </Switch>
            </Router>
          </div>
        </IntlProvider>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    authenticating: state.core.authenticating,
    user: state.core.user,
    error: state.core.error
  }
};

export default withHistory(connect(mapStateToProps, { auth })(
  withModulesManager(withTheme(withStyles(styles)(RootApp))),
));
