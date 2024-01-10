import React, { useMemo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { IntlProvider } from "react-intl";
import { Redirect, Route, BrowserRouter, Switch } from "react-router-dom";
import { CssBaseline } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import withModulesManager, { ModulesManagerProvider } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import RequireAuth from "./RequireAuth";
import FatalError from "./generics/FatalError";
import { clearConfirm } from "../actions";
import AlertDialog from "./dialogs/AlertDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import { bindActionCreators } from "redux";
import Contributions from "./generics/Contributions";
import LoginPage from "../pages/LoginPage";
import { useAuthentication } from "../helpers/hooks";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import SetPasswordPage from "../pages/SetPasswordPage";
import { ErrorBoundary } from "@openimis/fe-core";
import { onLogout } from "../helpers/utils";
import { RIGHT_VIEW_EU_MODAL } from "../constants";

export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const UNAUTHENTICATED_ROUTER_CONTRIBUTION_KEY = "core.UnauthenticatedRouter";
export const APP_BOOT_CONTRIBUTION_KEY = "core.Boot";
export const TRANSLATION_CONTRIBUTION_KEY = "translations";
export const ECONOMIC_UNIT_DIALOG_CONTRIBUTION_KEY = "policyholder.EconomicUnitDialog";

const ECONOMIC_UNIT_STORAGE_KEY = "userEconomicUnit";

const styles = () => ({
  fetching: {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});

const App = (props) => {
  const {
    history,
    classes,
    error,
    confirm,
    user,
    messages,
    clearConfirm,
    localesManager,
    modulesManager,
    basename = process.env.PUBLIC_URL,
    ...others
  } = props;

  const economicUnitConfig = modulesManager.getConf("fe-core", "App.economicUnitConfig", false);

  const [economicUnitDialogOpen, setEconomicUnitDialogOpen] = useState(false);

  const auth = useAuthentication();
  const routes = useMemo(() => {
    return modulesManager.getContribs(ROUTER_CONTRIBUTION_KEY);
  }, []);

  const unauthenticatedRoutes = useMemo(() => {
    return modulesManager.getContribs(UNAUTHENTICATED_ROUTER_CONTRIBUTION_KEY);
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
    if (process.env.NODE_ENV == "development") {
      // In development, redirect the browser to the basename if
      // the location is currently the root path
      if (location.pathname === "/") {
        location.replace(basename);
      }
    }
  }, []);

  useEffect(() => {
    const userHasModalRight = user?.rights ? user.rights.includes(RIGHT_VIEW_EU_MODAL) : false;
    if (economicUnitConfig && userHasModalRight && auth.isAuthenticated && !localStorage.getItem(ECONOMIC_UNIT_STORAGE_KEY)) {
      setEconomicUnitDialogOpen(true);
    }

    if (!economicUnitConfig || (economicUnitConfig && !auth.isAuthenticated)) {
      setEconomicUnitDialogOpen(false);
    }
  }, [auth, economicUnitDialogOpen, user]);


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
          {economicUnitConfig ? (
            <Contributions
              contributionKey={ECONOMIC_UNIT_DIALOG_CONTRIBUTION_KEY}
              open={economicUnitDialogOpen}
              setEconomicUnitDialogOpen={setEconomicUnitDialogOpen}
              onLogout={onLogout}
            />
          ) : null}
          <div className="App">
            {auth.isAuthenticated && <Contributions contributionKey={APP_BOOT_CONTRIBUTION_KEY} />}
            <BrowserRouter basename={basename}>
              <Switch>
                <Route exact path="/" render={() => <Redirect to={"/home"} />} />
                <Route path={"/login"} render={() => <LoginPage {...others} />} />
                <Route path={"/forgot_password"} render={() => <ForgotPasswordPage {...others} />} />
                <Route path={"/set_password"} render={() => <SetPasswordPage {...others} />} />
                {unauthenticatedRoutes.map((route) => (
                  <Route
                    exact
                    key={route.path}
                    path={"/" + route.path}
                    render={(props) => (
                      <ErrorBoundary>
                        <route.component modulesManager={modulesManager} {...props} {...others} />
                      </ErrorBoundary>
                    )}
                  />
                ))}
                {routes.map((route) => (
                  <Route
                    exact
                    key={route.path}
                    path={"/" + route.path}
                    render={(props) => (
                      <ErrorBoundary>
                        <RequireAuth
                          {...props}
                          {...others}
                          redirectTo={"/login"}
                          onEconomicDialogOpen={() => setEconomicUnitDialogOpen(true)}
                        >
                          <route.component modulesManager={modulesManager} {...props} {...others} />
                        </RequireAuth>
                      </ErrorBoundary>
                    )}
                  />
                ))}
              </Switch>
            </BrowserRouter>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(withModulesManager(App))));
