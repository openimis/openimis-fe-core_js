import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "../helpers/history";
import { styled } from "@mui/material/styles";
import { Button, Box, Grid, Paper, LinearProgress, Divider, Link, Typography } from "@mui/material";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import { useAuthentication } from "../helpers/hooks";
import Contributions from "./../components/generics/Contributions";
import { baseApiUrl } from "../actions";
import { DEFAULT, SAML_LOGIN_PATH } from "../constants";
import GetIconComponent from "../helpers/icons";
import { throttledMessage } from "../helpers/secondFactor";

const ArrowBackIcon = GetIconComponent("ArrowBack");

const StyledLoginPage = styled("div")(({ theme }) => ({
  "& .container": {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  "& .paper": theme.paper?.paper ?? {},
  "& .logo": {
    width: "100%",
    padding: theme.spacing(2),
  },
}));

const SECOND_FACTOR_STEP = { CODE: "code", ENROL: "enrol" };
const THROTTLE_KEYS = {
  dated: "core.LoginPage.secondFactor.throttled",
  undated: "core.LoginPage.secondFactor.throttledNoTime",
};

const LOGIN_PAGE_CONTRIBUTION_KEY = "core.LoginPage";
const LOGIN_PAGE_MPASS_CONTRIBUTION_KEY = "workerVoucher.MPassLoginButton";

const LoginPage = ({ logo }) => {
  const history = useHistory();
  const location = useLocation();
  const modulesManager = useModulesManager();
  const translations = useTranslations("core.LoginPage", modulesManager);
  const { formatMessage } = translations;
  const [credentials, setCredentials] = useState({ username: location.state?.username });
  const [serverResponse, setServerResponse] = useState({ loginStatus: "", message: null });
  const [secondFactorStep, setSecondFactorStep] = useState(null);
  const auth = useAuthentication();
  const [isAuthenticating, setAuthenticating] = useState(false);
  const showMPassProvider = modulesManager.getConf("fe-core", "LoginPage.showMPassProvider", false);
  const linkToUserGuide = modulesManager.getConf("fe-core", "LoginPage.linkToUserGuide", "https://docs.openimis.org/");
  const enablePublicPage = modulesManager.getConf("fe-core", "App.enablePublicPage", DEFAULT.ENABLE_PUBLIC_PAGE);
  const secondFactor = modulesManager.getConf("fe-core", "App.secondFactor", DEFAULT.SECOND_FACTOR);

  useEffect(() => {
    if (auth.isAuthenticated && auth.isInitialized) {
      history.push("/");
    }
  }, [auth.isAuthenticated, auth.isInitialized, history]);

  const handleLoginError = (errorMessage, extensions) => {
    if (secondFactor && errorMessage === "SECOND_FACTOR_REQUIRED") {
      setSecondFactorStep(SECOND_FACTOR_STEP.CODE);
      setServerResponse({ loginStatus: "", message: null });
    } else if (secondFactor && errorMessage === "SECOND_FACTOR_ENROLMENT_REQUIRED") {
      setSecondFactorStep(SECOND_FACTOR_STEP.ENROL);
      setServerResponse({ loginStatus: "", message: null });
    } else {
      setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: errorMessage, extensions });
    }
    setAuthenticating(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setAuthenticating(true);

    try {
      const response = await auth.login(credentials);
      if (response.payload?.errors?.length) {
        handleLoginError(response.payload.errors[0].message, response.payload.errors[0].extensions);
        return;
      }

      const { loginStatus, message, extensions } = response;

      if (loginStatus === "CORE_AUTH_ERR") {
        handleLoginError(message, extensions);
      } else {
        setServerResponse({ loginStatus, message });
        history.push("/");
      }
    } catch (error) {
      setAuthenticating(false);
    }
  };

  const startOver = () => {
    const { otp, ...rest } = credentials;
    setCredentials(rest);
    setSecondFactorStep(null);
    setServerResponse({ loginStatus: "", message: null });
  };

  const goToEnrolment = () =>
    history.push({ pathname: "/second_factor/enrol", state: { username: credentials.username } });

  const redirectToForgotPassword = (e) => {
    e.preventDefault();
    history.push("/forgot_password");
  };

  const errorMessages = {
    INCORRECT_CREDENTIALS: formatMessage("core.LoginPage.authError"),
    HF_CONTRACT_INVALID: formatMessage("core.LoginPage.authErrorHealthFacilityContractInvalid"),
    GENERAL: formatMessage("core.LoginPage.authErrorGeneral"),
    INVALID_SECOND_FACTOR: formatMessage("core.LoginPage.secondFactor.invalid"),
  };

  const getErrorMessage = (messageKey, extensions) => {
    if (messageKey === "SECOND_FACTOR_THROTTLED") {
      return throttledMessage(translations, THROTTLE_KEYS, extensions?.lockedUntil);
    }
    return errorMessages[messageKey] || messageKey;
  };

  const redirectToMPassLogin = (e) => {
    e.preventDefault();
    const redirectToURL = new URL(`${window.location.origin}${baseApiUrl}${SAML_LOGIN_PATH}`);

    window.location.href = redirectToURL.href;
  };

  return (
    <StyledLoginPage>
      {isAuthenticating && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}
      <div className="container">
        <Helmet title={formatMessage("pageTitle")} />
        <Paper className="paper" elevation={2}>
          <form onSubmit={onSubmit}>
            <Box p={6} width={380}>
              <Grid container spacing={2} direction="column" alignItems="stretch">
                {enablePublicPage && (
                  <Grid container direction="row" alignItems="center">
                    <Button
                      onClick={() => history.push("/")}
                      startIcon={<ArrowBackIcon />}
                      color="primary"
                      variant="text"
                    >
                      {formatMessage("backButton")}
                    </Button>
                  </Grid>
                )}
                <Grid container direction="row" alignItems="center">
                  <img className="logo" src={logo} />
                  {
                    <Box pl={2} fontWeight="fontWeightMedium" fontSize="h4.fontSize">
                      {formatMessage("appName")}
                    </Box>
                  }
                </Grid>
                {showMPassProvider ? (
                  <Grid>
                    <Box display="flex" alignItems="center" justifyContent="center" my={2}>
                      <Typography style={{ textTransform: "uppercase" }} variant="body2">
                        {formatMessage("loginCaption")}
                      </Typography>
                    </Box>
                    <Contributions contributionKey={LOGIN_PAGE_MPASS_CONTRIBUTION_KEY} onClick={redirectToMPassLogin} />
                    <Box display="flex" alignItems="center" mt={4} mb={2}>
                      <Divider style={{ flex: 1 }} />
                      <Link
                        href={linkToUserGuide}
                        underline="hover"
                        style={{ margin: "0 12px", cursor: "pointer" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Typography style={{ textTransform: "uppercase" }} variant="body1">
                          {formatMessage("howToUse")}
                        </Typography>
                      </Link>
                      <Divider style={{ flex: 1 }} />
                    </Box>
                  </Grid>
                ) : (
                  <>
                    <Grid>
                      <TextInput
                        required
                        readOnly={isAuthenticating || secondFactorStep !== null}
                        module={"core.LoginPage"}
                        label={"username.label"}
                        fullWidth
                        value={credentials.username}
                        onChange={(username) => setCredentials({ ...credentials, username })}
                      />
                    </Grid>
                    <Grid>
                      <TextInput
                        required
                        readOnly={isAuthenticating || secondFactorStep !== null}
                        type="password"
                        module={"core.LoginPage"}
                        label={"password.label"}
                        fullWidth
                        onChange={(password) => setCredentials({ ...credentials, password })}
                      />
                    </Grid>
                    {secondFactorStep === SECOND_FACTOR_STEP.CODE && (
                      <Grid>
                        <Typography variant="body2">{formatMessage("secondFactor.hint")}</Typography>
                        <TextInput
                          required
                          autoFocus
                          readOnly={isAuthenticating}
                          module={"core.LoginPage"}
                          label={"secondFactor.code.label"}
                          fullWidth
                          inputProps={{ autoComplete: "one-time-code" }}
                          onChange={(otp) => setCredentials({ ...credentials, otp })}
                        />
                      </Grid>
                    )}
                    {secondFactorStep === SECOND_FACTOR_STEP.ENROL && (
                      <Grid>
                        <Typography variant="body2">{formatMessage("secondFactor.enrolmentRequired")}</Typography>
                        <Button fullWidth color="primary" variant="contained" onClick={goToEnrolment}>
                          {formatMessage("secondFactor.enrolBtn")}
                        </Button>
                      </Grid>
                    )}
                    {serverResponse?.message && (
                      <Grid>
                        <Box color="error.main">
                          {getErrorMessage(serverResponse.message, serverResponse.extensions)}
                        </Box>
                      </Grid>
                    )}
                    {secondFactorStep !== SECOND_FACTOR_STEP.ENROL && (
                      <Grid>
                        <Button
                          fullWidth
                          type="submit"
                          disabled={
                            isAuthenticating ||
                            !(credentials.username && credentials.password) ||
                            (secondFactorStep === SECOND_FACTOR_STEP.CODE && !credentials.otp)
                          }
                          color="primary"
                          variant="contained"
                        >
                          {formatMessage("loginBtn")}
                        </Button>
                      </Grid>
                    )}
                    <Grid>
                      {secondFactorStep === null ? (
                        <Button onClick={redirectToForgotPassword}>{formatMessage("forgotPassword")}</Button>
                      ) : (
                        <Button onClick={startOver}>{formatMessage("secondFactor.otherAccount")}</Button>
                      )}
                      <Contributions contributionKey={LOGIN_PAGE_CONTRIBUTION_KEY} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </form>
        </Paper>
      </div>
    </StyledLoginPage>
  );
};

export default LoginPage;
