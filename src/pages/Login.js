import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import withHistory from "../helpers/history";

const styles = theme => ({
    button: {
        margin: theme.spacing(2),
        color: theme.palette.secondary.main,
    }
})

class Login extends Component {

    render() {
        const { classes } = this.props;
        return (
            <div>LOGIN</div>
        )
    }

}

export default withHistory(withStyles(styles)(Login));