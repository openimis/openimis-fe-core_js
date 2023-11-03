import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { onLogout, redirectToMPassLogout } from "../helpers/utils";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
}));

const LogoutButton = () => {
  const history = useHistory();
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

  const classes = useStyles();

  return (
    <IconButton className={classes.button} onClick={onClick}>
      <ExitToApp />
    </IconButton>
  );
};

export default LogoutButton;
