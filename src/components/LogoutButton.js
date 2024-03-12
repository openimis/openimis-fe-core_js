import React from "react";
import { useDispatch } from "react-redux";

import { IconButton, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ExitToApp } from "@material-ui/icons";

import { MODULE_NAME } from "../constants";
import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { onLogout, redirectToSamlLogout } from "../helpers/utils";
import { useTranslations } from "../helpers/i18n";

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
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
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
    <Tooltip title={formatMessage("core.tooltip.logout")}>
      <IconButton className={classes.button} onClick={onClick}>
        <ExitToApp />
      </IconButton>
    </Tooltip>
  );
};

export default LogoutButton;
