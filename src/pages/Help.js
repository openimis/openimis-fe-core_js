import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import { useModulesManager } from "@openimis/fe-core";
import {CORE_MIS_CONFLUENCE_URL, DEFAULT_URL} from "../constants";

const styles = (theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
});

const Help = ({ classes }) => {
  const modulesManager = useModulesManager();
  const isCoreMISHelp = modulesManager.getConf("fe-core", "redirectToCoreMISConfluenceUrl", false);
  const url = isCoreMISHelp ? CORE_MIS_CONFLUENCE_URL : DEFAULT_URL;
  const onClick = () => {
    window.open(url);
  };

  return (
    <IconButton className={classes.button} onClick={onClick}>
      <HelpOutline />
    </IconButton>
  );
};

export default withStyles(styles)(Help);
