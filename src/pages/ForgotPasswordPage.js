import React, { useState } from "react";

import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, Typography } from "@material-ui/core";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import { useGraphqlMutation } from "../helpers/hooks";

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

const ForgotPasswordPage = (props) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.ForgotPasswordPage", modulesManager);
  const [username, setUsername] = useState();
  const [isDone, setDone] = useState(false);
  const { isLoading, mutate } = useGraphqlMutation(
    `
    mutation resetPassword($input: ResetPasswordMutationInput!) {
      resetPassword(input: $input) {
        clientMutationId
        success
        error
      }
    }
  `,
    {
      wait: false,
    },
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    await mutate({ username });
    await setDone(true);
  };

  return (
    <>
      <div className={classes.container}>
        <Helmet title={formatMessage("pageTitle")} />
        <Paper className={classes.paper} elevation={2}>
          <form onSubmit={onSubmit}>
            <Box p={3} width={500}>
              {!isDone && (
                <Grid container spacing={2} direction="column" alignItems="stretch">
                  <Grid item>
                    <h1>{formatMessage("recoverTitle")}</h1>
                  </Grid>
                  <Grid item>
                    <Typography>{formatMessage("explanationMessage")}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{formatMessage("contactAdministrator")}</Typography>
                  </Grid>
                  <Grid item>
                    <TextInput
                      required
                      readOnly={isLoading}
                      label={formatMessage("username.label")}
                      fullWidth
                      onChange={(username) => setUsername(username)}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={!username || isLoading}
                      color="primary"
                      variant="contained"
                    >
                      {formatMessage("submitBtn")}
                    </Button>
                  </Grid>
                </Grid>
              )}

              {isDone && <h1>{formatMessage("done")}</h1>}
            </Box>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
