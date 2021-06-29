import React, { Component } from "react";
import { connect } from "react-redux";
import { IntlProvider } from 'react-intl';
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { CssBaseline, CircularProgress } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import withHistory, { historyPush } from "../helpers/history";
import withModulesManager from "../helpers/modules";
import AppWrapper from "./AppWrapper";
import FatalError from './generics/FatalError';
import kebabCase from "lodash/kebabCase";
import { auth } from "../actions";
import AlertDialog from "./dialogs/AlertDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import Login from "../pages/Login";

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

  componentDidUpdate(prevProps) {
    const { error, authenticating, modulesManager, history, user } = this.props;
    if (prevProps.authenticating && !authenticating) {
      if (error && !user) {
        historyPush(modulesManager, history, "core.route.login");
      }
    }
  }
  buildMessages(messages, lang) {
    let file = this.props.localesManager.getFileNameByLang(lang)
    var msgs = this.props.modulesManager
      .getContribs(TRANSLATION_CONTRIBUTION_KEY)
      .filter(msgs => msgs.key === file)
      .reduce((allmsgs, msgs) => Object.assign(allmsgs, msgs.messages), {})
    return { ...messages, ...msgs };
  }

  render() {
    const { history, classes, error, alert, confirm, user, messages, authenticating, ...others } = this.props;
    if (error && user) {
      return <FatalError error={error} />;
    }
    if (authenticating) {
      return (
        <div>
          <CircularProgress className={classes.fetching} />
        </div>
      );
    }
    return (
      <IntlProvider
        locale={this.props.localesManager.getLocale(user.language)}
        messages={this.buildMessages(messages, user.language)}
      >
        <div className="App">
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <CssBaseline />
          <AlertDialog alert={alert} />
          <ConfirmDialog confirm={confirm} />
          <Router history={history}>
            <Switch>
              {
                !user && (
                  <Route
                    exact
                    path={`${process.env.PUBLIC_URL || ""}/login`}
                    render={() => <Login/>}
                  />
                )
              }
              {
                user && (
                  <>
                    <Route
                      exact
                      path={`${process.env.PUBLIC_URL || ""}/`}
                      render={() => {
                        let search = this.props.history.location.search;
                        if (!search) {
                          return <Redirect to={`${process.env.PUBLIC_URL || ""}/home`} />
                        } else {
                          return <Redirect to={`${atob(search.substring(5))}`} />
                        }
                      }}
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
                  </>
                )
              }
            </Switch>
          </Router>
        </div>
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticating: state.core.authenticating,
  user: !!state.core.user && state.core.user.i_user,
  error: state.core.error,
  alert: state.core.alert,
  confirm: state.core.confirm,
})

export default withHistory(connect(mapStateToProps, { auth })(
  withModulesManager(withTheme(withStyles(styles)(RootApp))),
));
