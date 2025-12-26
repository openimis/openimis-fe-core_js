import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/styles";
import cookie from "cookie_js";
import React, { useEffect, useState } from "react";
import TextInput from "../components/inputs/TextInput";
import Helmet from "../helpers/Helmet";
import { useHistory } from "../helpers/history";
import { useAuthentication } from "../helpers/hooks";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import Contributions from "./../components/generics/Contributions";

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
  paper: theme.paper.loginPaper,
  logo: {
    maxHeight: 100,
    width: 100,
  },
  inputAdornment: {
    backgroundColor: "#0000", // Adjust based on your theme
  },
}));

const LOGIN_PAGE_CONTRIBUTION_KEY = "core.LoginPage";

const LoginPage = ({ logo, backgroundImage }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.LoginPage", modulesManager);
  const [credentials, setCredentials] = useState({});
  const [hasError, setError] = useState(false);
  const auth = useAuthentication();
  const [isAuthenticating, setAuthenticating] = useState(false);
  const initialState = localStorage.getItem("rememberMe") === "true";
  const [rememberMe, setRememberMe] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  const handleRememberMeChange = (event) => {
    const isChecked = event.target.checked;
    setRememberMe(isChecked);

    console.log("Remember Me is checked:", isChecked);

    if (!isChecked) {
      // If "Remember Me" is unchecked, clear the saved credentials.
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    } else {
      // If "Remember Me" is checked, save the username and password.
      localStorage.setItem("rememberedUsername", credentials.username);
      localStorage.setItem("rememberedPassword", credentials.password);

      console.log("Saved username and password:", credentials.username, credentials.password);
    }

    localStorage.setItem("rememberMe", isChecked.toString());
  };

  useEffect(() => {
    cookie.remove("gedHealthStatus");
    cookie.remove("odooHealthStatus");
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      history.push("/");
    } else {
      // If "Remember Me" is checked, retrieve and set the saved credentials.
      if (rememberMe) {
        const savedUsername = localStorage.getItem("rememberedUsername");
        const savedPassword = localStorage.getItem("rememberedPassword");
        if (savedUsername && savedPassword) {
          setCredentials({ username: savedUsername, password: savedPassword });
        }
      }
    }
  }, []);

  console.log("==> cred", credentials);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setAuthenticating(true);

    if (!rememberMe) {
      console.log("Don't remember");
      // If "Remember Me" is unchecked, clear the saved credentials.
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    } else {
      console.log("Remember");
      // If "Remember Me" is checked, save the username and password.
      localStorage.setItem("rememberedUsername", credentials.username);
      localStorage.setItem("rememberedPassword", credentials.password);

      console.log("Saved username and password:", credentials.username, credentials.password);
    }

    if (await auth.login(credentials)) {
      sessionStorage.removeItem("session_expired");
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
  return (
    <>
      {isAuthenticating && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}
      <div
        style={{
          background: "#000000B2 0% 0%",
          opacity: "0.9",
        }}
      >
        <div
          style={{
            height: "100vh",
            width: "100vw",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "fill",
          }}
        >
          <div className={classes.container}>
            <Helmet title={formatMessage("pageTitle")} />

            <Paper className={classes.paper} elevation={2}>
              <form onSubmit={onSubmit}>
                <Box p={6} width={530}>
                  <Grid container spacing={2} direction="column" alignItems="stretch" justifyContent="center">
                    <Grid item container direction="row" alignItems="center">
                      <img className={classes.logo} src={logo} style={{ margin: "0 auto" }} />
                      {/* <Box pl={2} fontWeight="fontWeightMedium" fontSize="h4.fontSize">
                    {formatMessage("core.displayAppName")}
                  </Box> */}
                    </Grid>
                    {/* <Grid item>
                    <Text>"Insurance Management System"</Text>
                  </Grid> */}
                    <div
                      style={{
                        textAlign: "center",
                        font: "normal normal bold 24px/42px Roboto",
                        color: "#333333",
                        marginTop: "10px",
                      }}
                    >
                      CAMU IMS
                    </div>

                    <div>
                      {sessionStorage.getItem("session_expired") && (
                        <Alert severity="error">Votre session a expiré. Veuillez vous reconnecter.</Alert>
                      )}
                    </div>

                    <Grid item>
                      <TextInput
                        required
                        readOnly={isAuthenticating}
                        label={formatMessage("username.label")}
                        fullWidth
                        value={credentials.username}
                        defaultValue={credentials.username}
                        onChange={(username) => setCredentials({ ...credentials, username })}
                        autoComplete={rememberMe ? "username" : "off"}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        disabled={isAuthenticating}
                        type={showPassword ? "text" : "password"}
                        label={formatMessage("password.label")}
                        fullWidth
                        value={credentials.password}
                        onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                        autoComplete={rememberMe ? "current-password" : "off"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end" className={classes.inputAdornment}>
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                              >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    {hasError && (
                      <Grid item>
                        <Box color="#FF0000">{formatMessage("authError")}</Box>
                      </Grid>
                    )}
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item xs={6} sx={{ m: 2 }}>
                        <FormControlLabel
                          label={formatMessage("rememberMe")}
                          style={{
                            color: "#999999",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                          control={
                            <Checkbox
                              color="primary"
                              style={{ paddingLeft: "20px" }}
                              checked={rememberMe}
                              onChange={handleRememberMeChange}
                            />
                          }
                        />
                      </Grid>
                      <div
                        style={{
                          color: "#00913E",
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          textAlign: "right",
                          paddingRight: "10px",
                        }}
                        onClick={redirectToForgotPassword}
                      >
                        {formatMessage("forgotPassword")}
                      </div>
                      <Contributions
                        contributionKey={LOGIN_PAGE_CONTRIBUTION_KEY}
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          textAlign: "right",
                        }}
                      />
                    </Grid>
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
                  </Grid>
                </Box>
              </form>
            </Paper>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
