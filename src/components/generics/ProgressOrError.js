import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import Error from "./Error";

const styles = theme => ({
    progress: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",       
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        align: "center",
    }
});

class ProgressOrError extends Component {
    render() {
        const { classes, progress, error } = this.props;
        return (
            <Fragment>
                {!!progress && <CircularProgress className={classes.progress} />}
                {!progress && !!error && <Error error={error} />}
            </Fragment>
        )
    }
}

export default withTheme(withStyles(styles)(ProgressOrError));