import React, { useMemo, useState, useEffect } from "react";
import { useHistory } from "../helpers/history";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress, Tooltip } from "@material-ui/core";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import { useAuthentication } from "../helpers/hooks";
import Contributions from "./../components/generics/Contributions";
import MPassLogo from "./../mPassLogoColor.svg";
import { baseApiUrl } from "../actions";

const useStyles = makeStyles((theme) => ({
  container: {
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
  paper: theme.paper.paper,
  logo: {
    maxHeight: 100,
    width: 100,
  },
}));

const LOGIN_PAGE_CONTRIBUTION_KEY = "core.LoginPage";

const LoginPage = ({ logo }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.LoginPage", modulesManager);
  const [credentials, setCredentials] = useState({});
  const [hasError, setError] = useState(false);
  const [hasMPassError, setMPassError] = useState(false);
  const auth = useAuthentication();
  const [isAuthenticating, setAuthenticating] = useState(false);
  const showMPassProvider = modulesManager.getConf("fe-core", "LoginPage.showMPassProvider", false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      history.push("/");
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setAuthenticating(true);
    if (await auth.login(credentials)) {
      history.push("/");
    } else {
      setError(true);
      setAuthenticating(false);
    }
  };

  const redirectToForgotPassword = (e) => {
    e.preventDefault();
    history.push("/forgot_password");
  };

  const redirectToMPassLogin = (e) => {
    e.preventDefault();
    const redirectToURL = new URL(`${window.location.origin}${baseApiUrl}/msystems/saml/login/`);
    
    window.location.href = redirectToURL.href;
  };

  return (
    <>
      {isAuthenticating && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}
      <div className={classes.container}>
        <Helmet title={formatMessage("pageTitle")} />
        <Paper className={classes.paper} elevation={2}>
          <form onSubmit={onSubmit}>
            <Box p={6} width={380}>
              <Grid container spacing={2} direction="column" alignItems="stretch">
                <Grid item container direction="row" alignItems="center">
                  <img className={classes.logo} src={logo} />
                  <Box pl={2} fontWeight="fontWeightMedium" fontSize="h4.fontSize">
                    {formatMessage("appName")}
                  </Box>
                </Grid>
                {showMPassProvider ? (
                  <>
                    <Grid item>
                      <Tooltip title={formatMessage("loginWithMPass")}>
                        <Button fullWidth type="submit" onClick={redirectToMPassLogin}>
                          <MPassLogo />
                        </Button>
                      </Tooltip>
                    </Grid>
                    {hasMPassError && (
                      <Grid item>
                        <Box color="error.main">{formatMessage("authMPassError")}</Box>
                      </Grid>
                    )}
                  </>
                ) : (
                  <>
                    <Grid item>
                      <TextInput
                        required
                        readOnly={isAuthenticating}
                        label={formatMessage("username.label")}
                        fullWidth
                        defaultValue={credentials.username}
                        onChange={(username) => setCredentials({ ...credentials, username })}
                      />
                    </Grid>
                    <Grid item>
                      <TextInput
                        required
                        readOnly={isAuthenticating}
                        type="password"
                        label={formatMessage("password.label")}
                        fullWidth
                        onChange={(password) => setCredentials({ ...credentials, password })}
                      />
                    </Grid>
                    {hasError && (
                      <Grid item>
                        <Box color="error.main">{formatMessage("authError")}</Box>
                      </Grid>
                    )}
                    <Grid item>
                      <Button
                        fullWidth
                        type="submit"
                        disabled={isAuthenticating || !(credentials.username && credentials.password)}
                        color="primary"
                        variant="contained"
                      >
                        {formatMessage("loginBtn")}
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button onClick={redirectToForgotPassword}>{formatMessage("forgotPassword")}</Button>
                      <Contributions contributionKey={LOGIN_PAGE_CONTRIBUTION_KEY} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default LoginPage;
