import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import withHistory from "../helpers/history";

const styles = theme => ({
    button: {
        margin: theme.spacing(2),
        color: theme.palette.secondary.main,
    }
})

class Logout extends Component {
    
    logout = () => {
        this.props.history.push("/logout");
        window.location.reload();
    }

    render() {
        const { classes } = this.props;
        
        return (
            <IconButton className={classes.button} onClick={this.logout}>
                <ExitToApp />
            </IconButton>
        )
    }

}

export default withHistory(withStyles(styles)(Logout));