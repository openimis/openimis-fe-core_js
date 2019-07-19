import React, { Fragment } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import { Typography, Divider } from "@material-ui/core";

const styles = theme => ({
  error: {
    padding: theme.spacing(2)
  },
  errorHeader: {
    color: theme.palette.error.main,
  },
  errorDetail: {
    color: theme.palette.error.main,
  }  
});

function Error(props) {
  const { classes, code, message, detail } = props;
  return (
    <div className={classes.error}>
      <Typography variant="h6" className={classes.errorHeader}>{code}: {message}</Typography>
      {detail && (
        <Fragment>
          <Divider />
          <Typography variant="body1" className={classes.errorCode}>{detail}</Typography>
        </Fragment>
      )}
    </div>
  );
}

export default withStyles(styles)(Error);
