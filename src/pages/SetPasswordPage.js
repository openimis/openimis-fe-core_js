import React, { useState, useMemo } from "react";

import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress } from "@material-ui/core";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import withHistory from "../helpers/history";
import Helmet from "../helpers/Helmet";
import { useAuthentication, useGraphqlMutation } from "../helpers/hooks";

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

const SetPasswordPage = ({ history }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.SetPasswordPage", modulesManager);
  const [credentials, setCredentials] = useState({});
  const { mutate, isLoading } = useGraphqlMutation(
    `
      mutation setPassword ($input: SetPasswordMutationInput!) {
        setPassword(input: $input) {
          clientMutationId
        }
      }
    `,
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isValid) {
      await mutate({ token: location.query.token, password: credentials.password });
    }
    history.push(process.env.PUBLIC_URL);
  };

  const isValid = useMemo(
    () => credentials.confirmPassword && credentials.password && credentials.password === credentials.confirmPassword,
    [credentials],
  );

  return (
    <>
      <div className={classes.container}>
        <Helmet title={formatMessage("pageTitle")} />
        <Paper className={classes.paper} elevation={2}>
          <form onSubmit={onSubmit}>
            <Box p={6} width={450}>
              <Grid container spacing={2} direction="column" alignItems="stretch">
                <Grid item>
                  <TextInput
                    required
                    type="password"
                    label={formatMessage("password.label")}
                    fullWidth
                    onChange={(password) => setCredentials({ ...credentials, password })}
                  />
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    type="password"
                    label={formatMessage("confirmPassword.label")}
                    fullWidth
                    onChange={(confirmPassword) => setCredentials({ ...credentials, confirmPassword })}
                  />
                </Grid>

                <Grid item>
                  <Button fullWidth type="submit" disabled={!isValid} color="primary" variant="contained">
                    {formatMessage("submitBtn")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default withHistory(SetPasswordPage);
