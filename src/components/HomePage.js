import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import logo from "../../public/openIMIS.png";

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.primary.main,
    minHeight: "100vh"
  },
  logo: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: 250
  },
  formBox: {
    background: "white",
    width: 500,
    padding: 20
  }
});

class HomePage extends Component {
  render() {
      const { classes } = this.props;
      return (
        <div className={classes.logo}>
          <img src={logo} alt="openIMIS" />
        </div>
      );
  }
}

export default withStyles(styles)(HomePage);
