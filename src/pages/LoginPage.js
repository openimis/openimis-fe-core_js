import React, { useState } from "react";

import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress } from "@material-ui/core";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import withHistory from "../helpers/history";
import Helmet from "../helpers/Helmet";
import { useAuthentication } from "../helpers/hooks";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    margin: "auto",
    display: "flex",
    justifyContent: "center",
  },
  paper: theme.paper.paper,
  logo: {
    maxHeight: 100,
  },
}));

const LoginPage = ({ logo, history }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.LoginPage", modulesManager);
  const [credentials, setCredentials] = useState({});
  const auth = useAuthentication();

  const onSubmit = async (e) => {
    e.preventDefault();
    await auth.login(credentials);
    history.push(process.env.PUBLIC_URL);
  };

  return (
    <>
      {(auth.isAuthenticating || !auth.isInitialized) && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}
      {auth.isInitialized && (
        <div className={classes.container}>
          <Helmet title={formatMessage("pageTitle")} />
          <Paper className={classes.paper} elevation={2}>
            <form onSubmit={onSubmit}>
              <Box p={6} width={380}>
                <Grid container spacing={2} direction="column" alignItems="stretch">
                  <Grid item container direction="row" alignItems="center">
                    <img className={classes.logo} src={logo} />
                    <Box pl={2} fontWeight="fontWeightMedium" fontSize="h4.fontSize">
                      openIMIS
                    </Box>
                  </Grid>
                  <Grid item>
                    <TextInput
                      required
                      readOnly={auth.isAuthenticating}
                      label={formatMessage("username.label")}
                      fullWidth
                      onChange={(username) => setCredentials({ ...credentials, username })}
                    />
                  </Grid>
                  <Grid item>
                    <TextInput
                      required
                      readOnly={auth.isAuthenticating}
                      type="password"
                      label={formatMessage("password.label")}
                      fullWidth
                      onChange={(password) => setCredentials({ ...credentials, password })}
                    />
                  </Grid>
                  {auth.error && (
                    <Grid item>
                      <Box color="error.main">{auth.error.detail}</Box>
                    </Grid>
                  )}
                  <Grid item>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={auth.isAuthenticating || !(credentials.username && credentials.password)}
                      color="primary"
                      variant="contained"
                    >
                      {formatMessage("loginBtn")}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button>{formatMessage("forgotPassword")}</Button>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Paper>
        </div>
      )}
    </>
  );
};

export default withHistory(LoginPage);
