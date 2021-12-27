import React, { useMemo, useEffect } from "react";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { CssBaseline } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import withHistory from "../helpers/history";
import withModulesManager, { ModulesManagerProvider } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import RequireAuth from "./RequireAuth";
import FatalError from "./generics/FatalError";
import kebabCase from "lodash/kebabCase";
import { clearConfirm } from "../actions";
import AlertDialog from "./dialogs/AlertDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import { bindActionCreators } from "redux";
import Contributions from "./generics/Contributions";

import LoginPage from "../pages/LoginPage";
import { useAuthentication } from "../helpers/hooks";

export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const APP_BOOT_CONTRIBUTION_KEY = "core.Boot";
export const TRANSLATION_CONTRIBUTION_KEY = "translations";

const styles = () => ({
  fetching: {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});

const App = (props) => {
  const { history, classes, error, confirm, user, messages, clearConfirm, localesManager, modulesManager, ...others } =
    props;

  const auth = useAuthentication();
  const routes = useMemo(() => {
    return modulesManager.getContribs(ROUTER_CONTRIBUTION_KEY);
  }, []);

  const locale = useMemo(() => {
    if (user) {
      localesManager.getLocale(user.language);
    }
  }, [user?.language]);

  const allMessages = useMemo(() => {
    let lang;
    if (user) {
      lang = localesManager.getFileNameByLang(user.language);
    } else {
      lang = localesManager.getFileNameByLang(navigator.language) ?? "en";
    }
    var msgs = modulesManager
      .getContribs(TRANSLATION_CONTRIBUTION_KEY)
      .filter((msgs) => msgs.key === lang)
      .reduce((allmsgs, msgs) => Object.assign(allmsgs, msgs.messages), {});
    return { ...messages, ...msgs };
  }, [user?.language, messages]);

  useEffect(() => {
    auth.initialize();
  }, []);

  if (error) {
    return <FatalError error={error} />;
  }

  if (!auth.isInitialized) return null;

  return (
    <>
      <Helmet titleTemplate="%s - openIMIS" defaultTitle="openIMIS" />
      <CssBaseline />
      <ModulesManagerProvider value={modulesManager}>
        <IntlProvider locale={locale} messages={allMessages}>
          <AlertDialog />
          <ConfirmDialog confirm={confirm} onConfirm={clearConfirm} />
          <div className="App">
            {auth.isAuthenticated && (
              <Contributions modulesManager={modulesManager} contributionKey={APP_BOOT_CONTRIBUTION_KEY} />
            )}
            <Router history={history}>
              <Switch>
                <Route
                  path={process.env.PUBLIC_URL}
                  exact
                  render={() => <Redirect to={process.env.PUBLIC_URL + "/home"} />}
                />
                <Route path={process.env.PUBLIC_URL + "/login"} render={() => <LoginPage {...others} />} />
                {routes.map((route, index) => (
                  <Route
                    exact
                    key={`route_${kebabCase(route.path)}_${index}`}
                    path={process.env.PUBLIC_URL + "/" + route.path}
                    render={(props) => (
                      <RequireAuth {...props} {...others} redirectTo={process.env.PUBLIC_URL + "/login"}>
                        <route.component modulesManager={modulesManager} {...props} {...others} />
                      </RequireAuth>
                    )}
                  />
                ))}
              </Switch>
            </Router>
          </div>
        </IntlProvider>
      </ModulesManagerProvider>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.core.user?.i_user,
  error: state.core.error,
  confirm: state.core.confirm,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearConfirm }, dispatch);

export default withHistory(
  connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(withModulesManager(App)))),
);
