import React, { useState, useMemo, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Typography, Box, Grid, Paper, IconButton, InputAdornment } from "@material-ui/core";
import TextInput from "../components/inputs/TextInput";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import { useHistory } from "../helpers/history";
import Helmet from "../helpers/Helmet";
import { useGraphqlMutation } from "../helpers/hooks";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPasswordPolicy } from "../actions";
import { validatePassword } from '../helpers/passwordValidator';
import { passwordGenerator } from "../helpers/passwordGenerator";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import ClearIcon from "@material-ui/icons/Clear";

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
  passwordFeedback: {
    marginTop: theme.spacing(1),
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
}));


const SetPasswordPage = ({ fetchPasswordPolicy, passwordPolicy }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations("core.SetPasswordPage", modulesManager);
  const [credentials, setCredentials] = useState({});
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate } = useGraphqlMutation(
    `
      mutation setPassword($input: SetPasswordMutationInput!) {
        setPassword(input: $input) {
          clientMutationId
          success
          error
        }
      }
    `,
    { wait: false },
  );

  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const IS_PASSWORD_SECURED = passwordScore >= 2;

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    setCredentials({ token: search.get("token") });
    fetchPasswordPolicy();
  }, [fetchPasswordPolicy]);

  const handlePasswordChange = (password) => {
    const { feedback, score } = validatePassword(password, passwordPolicy, formatMessage, formatMessageWithValues);
    setPasswordFeedback(feedback);
    setPasswordScore(score);
    setCredentials({ ...credentials, password });
  };

  const handleSetPasswordError = (errorMessage) => {
    setError(errorMessage);
  };

  const generatePassword = () => {
    const newPassword = passwordGenerator({
      length: 12,
      isNumberRequired: true,
      isLowerCaseRequired: true,
      isUpperCaseRequired: true,
      isSpecialSymbolRequired: true,
    });
    handlePasswordChange(newPassword);
    setCredentials({ ...credentials, password: newPassword, confirmPassword: newPassword });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearPassword = () => {
    handlePasswordChange("");
    setCredentials({ ...credentials, password: "", confirmPassword: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isValid) {
      const result = await mutate({
        username: credentials.username,
        token: credentials.token,
        newPassword: credentials.password,
      });
      if (result?.setPassword.success) {
        history.push("/");
      } else {
        handleSetPasswordError(result?.setPassword.error || formatMessage("error"));
      }
    }
  };

  const isValid = useMemo(
    () =>
      credentials.confirmPassword &&
      credentials.password &&
      credentials.password === credentials.confirmPassword &&
      credentials.username &&
      credentials.token,
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
                    type="text"
                    label={formatMessage("username.label")}
                    fullWidth
                    onChange={(username) => setCredentials({ ...credentials, username })}
                  />
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    type={showPassword ? "text" : "password"}
                    label={formatMessage("password.label")}
                    fullWidth
                    onChange={(password) => handlePasswordChange(password)}
                    value={credentials.password || ""}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <IconButton onClick={clearPassword} edge="end">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    type={showPassword ? "text" : "password"}
                    label={formatMessage("confirmPassword.label")}
                    fullWidth
                    onChange={(confirmPassword) => setCredentials({ ...credentials, confirmPassword })}
                    value={credentials.confirmPassword || ""}
                  />
                </Grid>
                <Grid item className={classes.buttonGroup}>
                  <Button onClick={generatePassword} variant="contained">
                    {formatMessage("core.SetPasswordPage.generatePassword")}
                  </Button>
                </Grid>
                {passwordFeedback && (
                  <Grid item>
                    <Typography color={IS_PASSWORD_SECURED ? "primary" : "error"} className={classes.passwordFeedback}>
                      {passwordFeedback}
                    </Typography>
                  </Grid>
                )}
                {error && (
                  <Grid item>
                    <Box color="error.main">{error}</Box>
                  </Grid>
                )}
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

const mapStateToProps = (state) => ({
  passwordPolicy: state.core.passwordPolicy, // Adjust based on your state structure
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPasswordPolicy,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(SetPasswordPage);
