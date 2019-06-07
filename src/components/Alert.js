import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import ErrorIcon from "@material-ui/icons/Error";
// import { leftIcon } from "../../helpers/commonStyles";

const styles = theme => ({
  danger: {
    background: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    padding: theme.spacing.unit * 2,
    display: "flex",
    borderRadius: 2,
  },
  // ...leftIcon(theme),
});

function Alert(props) {
  const { classes } = props;

  return (
    <div className={classes.danger}>
      {/* <ErrorIcon className={classes.leftIcon} /> */}
      {props.children}
    </div>
  );
}

export default withStyles(styles)(Alert);
