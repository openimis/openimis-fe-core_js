import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import withHistory from "../helpers/history";

const styles = theme => ({
    button: {
        margin: theme.spacing(2),
        color: theme.palette.secondary.main,
    }
})

class Help extends Component {
    
    help = () => {
        this.props.history.push("/Manual/IMIS_manual.pdf");
        window.location.reload();
    }

    render() {
        const { classes } = this.props;
        return (
            <IconButton className={classes.button} onClick={this.help}>
                <HelpOutline />
            </IconButton>
        )
    }

}

export default withHistory(withStyles(styles)(Help));