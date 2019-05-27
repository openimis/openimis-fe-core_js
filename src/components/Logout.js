import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton, ListItemSecondaryAction } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit * 2
    }
})

class Logout extends Component {

    logout = e => {
        this.props.history.push("/Logout.aspx");
    }

    render() {
        const { classes } = this.props;
        return (
            <IconButton className={classes.button} aria-label="Logout" onClick={this.logout}>
                <ExitToApp />
            </IconButton>
        )
    }

}

export default withStyles(styles)(Logout);