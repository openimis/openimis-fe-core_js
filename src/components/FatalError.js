import React, { Fragment } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import { Typography, Divider } from "@material-ui/core";

const styles = theme => ({
  fatal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    borderStyle: "solid",
    borderWidth: "thin",
    borderColor: theme.palette.error.secondary,
    padding: theme.spacing(2)
  },
  fatalHeader: {
    color: theme.palette.error.main,
  },
  fatalDetail: {
    color: theme.palette.error.main,
  }  
});

function FatalError(props) {
  const { classes, error } = props;
  return (
    <div className={classes.fatal}>
      <Typography variant="h6" className={classes.fatalHeader}>{error.code}: {error.message}</Typography>
      {!!error.detail && (
        <Fragment>
          <Divider />
          <Typography variant="body1" className={classes.fatalCode}>{error.detail}</Typography>
        </Fragment>
      )}
    </div>
  );
}

export default withStyles(styles)(FatalError);
