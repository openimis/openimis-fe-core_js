import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";

const styles = theme => ({
    button: {
        margin: theme.spacing(2),
        color: "white",
    }
})

class Logout extends Component {
    
    logout = () => {
        this.props.history.push("/Manual/IMIS_manual.pdf");
        window.location.reload();
    }

    render() {
        const { classes } = this.props;
        return (
            <IconButton className={classes.button} onClick={this.logout}>
                <HelpOutline />
            </IconButton>
        )
    }

}

export default withStyles(styles)(Logout);