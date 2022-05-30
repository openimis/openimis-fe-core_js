import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";

const styles = (theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
});

const Help = ({ classes }) => {
  const onClick = () => {
    window.open("/Manual/IMIS_manual.pdf");
  };

  return (
    <IconButton className={classes.button} onClick={onClick}>
      <HelpOutline />
    </IconButton>
  );
};

export default withStyles(styles)(Help);
