import React, { Component } from "react";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { CssBaseline, CircularProgress } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import withHistory from "../helpers/history";
import withModulesManager, { ModulesManagerProvider } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import AppWrapper from "./AppWrapper";
import FatalError from "./generics/FatalError";
import kebabCase from "lodash/kebabCase";
import { auth, clearConfirm } from "../actions";
import AlertDialog from "./dialogs/AlertDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import { bindActionCreators } from "redux";

export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const TRANSLATION_CONTRIBUTION_KEY = "translations";

const styles = (theme) => ({
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
    this.routerContributions = props.modulesManager.getContribs(ROUTER_CONTRIBUTION_KEY);
  }

  componentDidMount() {
    this.props.auth();
  }

  buildMessages(messages, lang) {
    const { localesManager, modulesManager } = this.props;
    const filename = localesManager.getFileNameByLang(lang);
    var msgs = modulesManager
      .getContribs(TRANSLATION_CONTRIBUTION_KEY)
      .filter((msgs) => msgs.key === filename)
      .reduce((allmsgs, msgs) => Object.assign(allmsgs, msgs.messages), {});
    return { ...messages, ...msgs };
  }

  render() {
    const { history, classes, error, alert, confirm, user, messages, clearConfirm, ...others } = this.props;
    if (error) {
      return <FatalError error={error} />;
    }
    if (!user) {
      return (
        <div>
          <CircularProgress className={classes.fetching} />
        </div>
      );
    }
    return (
      <ModulesManagerProvider value={this.props.modulesManager}>
        <IntlProvider
          locale={this.props.localesManager.getLocale(user.language)}
          messages={this.buildMessages(messages, user.language)}
        >
          <div className="App">
            <Helmet titleTemplate="%s - openIMIS" defaultTitle="openIMIS" />
            <CssBaseline />
            <AlertDialog alert={alert} />
            <ConfirmDialog confirm={confirm} onConfirm={clearConfirm} />
            <Router history={history}>
              <Switch>
                <Route
                  exact
                  path={`${process.env.PUBLIC_URL || ""}/`}
                  render={() =>
                    history.location.search ? (
                      <Redirect to={`${atob(history.location.search.substring(5))}`} />
                    ) : (
                      <Redirect to={`${process.env.PUBLIC_URL || ""}/home`} />
                    )
                  }
                />
                {this.routerContributions.map((route, index) => {
                  const Comp = route.component;
                  return (
                    <Route
                      exact
                      key={`route_${kebabCase(route.path)}_${index}`}
                      path={`${process.env.PUBLIC_URL || ""}/${route.path}`}
                      render={(props) => (
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
      </ModulesManagerProvider>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticating: state.core.authenticating,
  user: !!state.core.user && state.core.user.i_user,
  error: state.core.error,
  alert: state.core.alert,
  confirm: state.core.confirm,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ auth, clearConfirm }, dispatch);

export default withHistory(
  connect(mapStateToProps, mapDispatchToProps)(withModulesManager(withTheme(withStyles(styles)(RootApp)))),
);
