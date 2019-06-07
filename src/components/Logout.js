import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit * 2
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
            <IconButton className={classes.button} aria-label="Logout" onClick={this.logout}>
                <ExitToApp />
            </IconButton>
        )
    }

}

export default withStyles(styles)(Logout);