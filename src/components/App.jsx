import React, { useMemo, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { IntlProvider } from "react-intl";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { styled } from "@mui/material/styles";
import withModulesManager, { ModulesManagerProvider } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import RequireAuth from "./RequireAuth";
import FatalErrorPage from "./generics/FatalError";
import { clearConfirm, toggleCurrentCalendarType, fetchMaxLengthConstraints } from "../actions";
import AlertDialog from "./dialogs/AlertDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import { bindActionCreators } from "redux";
import Contributions from "./generics/Contributions";
import LoginPage from "../pages/LoginPage";
import { useAuthentication, useBoolean } from "../helpers/hooks";
import { useLocalStorage, setLocalStorage } from "../helpers/useLocalStorage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import SetPasswordPage from "../pages/SetPasswordPage";
import { onLogout } from "../helpers/utils";
import { RIGHT_VIEW_EU_MODAL } from "../constants";
import NotFoundPage from "./NotFoundPage";
import PermissionCheck from "./PermissionCheck";
import PublishedComponent from "./generics/PublishedComponent";
import PublicPageMiddleware from "./PublicPageMiddleware";
import { ToastProvider } from "../helpers/ToastContext";
import { PublicPageLanguageProvider } from "../helpers/PublicPageLanguageContext";
import { getCookie } from "../helpers/cookies";

// Downgrade formatjs MISSING_TRANSLATION errors to warnings instead of errors.
// Defer logging so React does not append a component stack in development.
const onIntlError = (err) => {
  if (err.code === "MISSING_TRANSLATION") {
    if (process.env.NODE_ENV !== "production") {
      const id = err?.descriptor?.id ?? "unknown";
      const locale = err?.descriptor?.locale ?? "en";
      queueMicrotask(() => {
        console.warn(`Missing translation "${id}" for locale "${locale}"`);
      });
    }
    return;
  }
  console.error(err);
};

export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const UNAUTHENTICATED_ROUTER_CONTRIBUTION_KEY = "core.UnauthenticatedRouter";
export const APP_BOOT_CONTRIBUTION_KEY = "core.Boot";
export const TRANSLATION_CONTRIBUTION_KEY = "translations";
export const ECONOMIC_UNIT_DIALOG_CONTRIBUTION_KEY = "policyholder.EconomicUnitDialog";
const ECONOMIC_UNIT_STORAGE_KEY = "userEconomicUnit";
const PUBLIC_PAGE_LANGUAGE_STORAGE_KEY = "publicPageLanguage";

const StyledApp = styled("div")(({ theme }) => ({
  "& .fetching": {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
}));

const App = (props) => {
  const {
    history,
    error,
    confirm,
    confirmed,
    user,
    messages,
    clearConfirm,
    localesManager,
    modulesManager,
    basename = process.env.PUBLIC_URL,
    toggleCurrentCalendarType,
    rights,
    ...others
  } = props;
  const dispatch = useDispatch();

  const economicUnitConfig = modulesManager.getConf("fe-core", "App.economicUnitConfig", false);

  const [economicUnitDialogOpen, setEconomicUnitDialogOpen] = useState(false);
  const [isSecondaryCalendar, setSecondaryCalendar] = useBoolean(true);
  const [economicUnit] = useLocalStorage(ECONOMIC_UNIT_STORAGE_KEY, null);
  const [lastConfirmIntent, setLastConfirmIntent] = useState(null);

  const auth = useAuthentication();
  const routes = useMemo(() => {
    return modulesManager.getContribs(ROUTER_CONTRIBUTION_KEY);
  }, []);

  const unauthenticatedRoutes = useMemo(() => {
    return modulesManager.getContribs(UNAUTHENTICATED_ROUTER_CONTRIBUTION_KEY);
  }, []);

  const locale = useMemo(() => {
    if (user) {
      return localesManager.getLocale(user.language);
    }
  }, [user?.language]);

  const allMessages = useMemo(() => {
    let lang;
    if (user) {
      lang = localesManager.getFileNameByLang(user.language);
    } else {
      const cookieLang = getCookie(PUBLIC_PAGE_LANGUAGE_STORAGE_KEY);
      lang = cookieLang ? cookieLang : localesManager.getFileNameByLang(navigator.language) ?? "en";
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
    dispatch(fetchMaxLengthConstraints());
  }, []);

  useEffect(() => {
    const userHasModalRight = user?.rights ? user.rights.includes(RIGHT_VIEW_EU_MODAL) : false;
    if (economicUnitConfig && userHasModalRight && auth.isAuthenticated && !economicUnit) {
      setEconomicUnitDialogOpen(true);
    }

    if (!economicUnitConfig || (economicUnitConfig && !auth.isAuthenticated)) {
      setEconomicUnitDialogOpen(false);
    }
  }, [auth, economicUnitDialogOpen, user, economicUnit]);

  useEffect(() => {
    setLocalStorage("isSecondaryCalendarEnabled", !isSecondaryCalendar);
    toggleCurrentCalendarType(!isSecondaryCalendar);
  }, [isSecondaryCalendar]);

  useEffect(() => {
    setLastConfirmIntent(confirm?.intent ?? null);
  }, [confirm]);

  useEffect(() => {
    const handleConfirm = async () => {
      if (confirmed === true && lastConfirmIntent === "csrf_logout") {
        await onLogout(dispatch);
      }
    };
    handleConfirm();
  }, [confirmed, lastConfirmIntent, dispatch]);

  if (error) {
    return (
      <IntlProvider locale={locale || "en"} messages={allMessages} onError={onIntlError}>
        <FatalErrorPage error={error} />
      </IntlProvider>
    );
  }

  if (!auth.isInitialized) return null;
  return (
    <StyledApp>
      <Helmet titleTemplate="%s - openIMIS" defaultTitle="openIMIS" />
      <CssBaseline />
      <ModulesManagerProvider value={modulesManager}>
        <PublicPageLanguageProvider>
          <IntlProvider locale={locale || "en"} messages={allMessages} onError={onIntlError}>
            <ToastProvider>
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
              <PublishedComponent pubRef="grievanceSocialProtection.GrievanceConfigurationDialog" rights={rights} />
              <div className="App">
                {auth.isAuthenticated && <Contributions contributionKey={APP_BOOT_CONTRIBUTION_KEY} />}
                <BrowserRouter basename={basename}>
                  <Switch>
                    <Route
                      exact
                      path="/"
                      render={() => <PublicPageMiddleware isAuthenticated={auth.isAuthenticated} {...others} />}
                    />
                    <Route path={"/login"} render={() => <LoginPage {...others} />} />
                    <Route path={"/forgot_password"} render={() => <ForgotPasswordPage {...others} />} />
                    <Route path={"/set_password"} render={() => <SetPasswordPage {...others} />} />
                    {unauthenticatedRoutes.map((route) => (
                      <Route
                        exact
                        key={route.path}
                        path={"/" + route.path}
                        render={(props) => <route.component modulesManager={modulesManager} {...props} {...others} />}
                      />
                    ))}
                    {routes.map((route) => (
                      <Route
                        exact
                        key={route.path}
                        path={"/" + route.path}
                        render={(props) => (
                          <RequireAuth
                            {...props}
                            {...others}
                            redirectTo={"/login"}
                            onEconomicDialogOpen={() => setEconomicUnitDialogOpen(true)}
                            isSecondaryCalendar={isSecondaryCalendar}
                            setSecondaryCalendar={setSecondaryCalendar}
                          >
                            <PermissionCheck
                              modulesManager={modulesManager}
                              userRights={rights}
                              requiredRights={route.rights}
                              {...others}
                            >
                              <route.component modulesManager={modulesManager} {...props} {...others} />
                            </PermissionCheck>
                          </RequireAuth>
                        )}
                      />
                    ))}
                    <Route render={() => <NotFoundPage {...others} />} />
                  </Switch>
                </BrowserRouter>
              </div>
            </ToastProvider>
          </IntlProvider>
        </PublicPageLanguageProvider>
      </ModulesManagerProvider>
    </StyledApp>
  );
};

const mapStateToProps = (state) => ({
  rights: state.core.user?.i_user?.rights ?? [],
  user: state.core.user?.i_user,
  error: state.core.error,
  confirm: state.core.confirm,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearConfirm, toggleCurrentCalendarType }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withModulesManager(App));
