import React from "react";

import { IconButton, Tooltip } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";

import { useModulesManager } from "@openimis/fe-core";
import { CORE_MIS_CONFLUENCE_URL, DEFAULT_URL, MODULE_NAME } from "../constants";
import { useTranslations } from "../helpers/i18n";

const styles = (theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
});

const Help = ({ classes }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const isCoreMISHelp = modulesManager.getConf("fe-core", "redirectToCoreMISConfluenceUrl", false);
  const url = isCoreMISHelp ? CORE_MIS_CONFLUENCE_URL : DEFAULT_URL;
  const onClick = () => {
    window.open(url);
  };

  return (
    <Tooltip title={formatMessage("core.tooltip.help")}>
      <IconButton className={classes.button} onClick={onClick}>
        <HelpOutline />
      </IconButton>
    </Tooltip>
  );
};

export default withStyles(styles)(Help);
