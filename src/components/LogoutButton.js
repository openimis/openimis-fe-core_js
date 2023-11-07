import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { onLogout, redirectToSamlLogout } from "../helpers/utils";

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
      redirectToSamlLogout(e);
    } else {
      await redirectToImisLogout();
    }
  };

  const redirectToImisLogout = async () => {
    await onLogout(dispatch);
    history.push("/");
  }

  const classes = useStyles();

  return (
    <IconButton className={classes.button} onClick={onClick}>
      <ExitToApp />
    </IconButton>
  );
};

export default LogoutButton;
