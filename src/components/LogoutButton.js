import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { baseApiUrl, logout } from "../actions";
import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { M_PASS_LOGOUT_PATH } from "../constants";
import {onLogout} from "../helpers/utils";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
}));

const LogoutButton = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const mPassLogout = modulesManager.getConf("fe-core", "LogoutButton.showMPassProvider", false);
  const onClick = async (e) => {
    if (mPassLogout) {
      await redirectToMPassLogout(e);
    } else {
      await redirectToImisLogout();
    }
  };

  const redirectToImisLogout = async () => {
    await onLogout();
    history.push("/");
  }

  const redirectToMPassLogout = async (e) => {
    e.preventDefault();
    const redirectToURL = new URL(`${window.location.origin}${baseApiUrl}${M_PASS_LOGOUT_PATH}`);

    window.location.href = redirectToURL.href;
  };

  const classes = useStyles();

  return (
    <IconButton className={classes.button} onClick={redirectToMPassLogout}>
      <ExitToApp />
    </IconButton>
  );
};

export default LogoutButton;
