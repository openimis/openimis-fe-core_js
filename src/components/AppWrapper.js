import React, { Component, Fragment } from "react";
import { Router } from "react-router-dom";
import withWidth from '@material-ui/core/withWidth';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Grid, Hidden, ClickAwayListener } from "@material-ui/core";
import Logout from "./Logout";
import Help from "./Help";
import { fade } from "@material-ui/core/styles/colorManipulator";
import withHistory from "../helpers/history";
import classNames from 'classnames';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider,
  Tooltip
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Contributions from "./Contributions";
import FormattedMessage from "./FormattedMessage";

export const APP_BAR_CONTRIBUTION_KEY = "core.AppBar";
export const MAIN_MENU_CONTRIBUTION_KEY = "core.MainMenu";
export const MAIN_SEARCHER_CONTRIBUTION_KEY = "core.MainSearcher";

const styles = theme => ({
  root: {
    display: 'flex',
  },
  grow: {
    flexGrow: 1
  },
  logo: {
    verticalAlign: "middle",
    margin: theme.typography.title.fontSize / 2,
    maxHeight: theme.typography.title.fontSize * 2,
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${theme.menu.drawer.width})`,
    marginLeft: theme.menu.drawer.width,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    margin: theme.spacing(0, 1, 0, 1),
    padding: 0,
  },
  autoHideMenuButton: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: theme.menu.drawer.width,
      flexShrink: 0,
    },
  },
  drawerHeader: {
    ...theme.mixins.toolbar,
    margin: theme.spacing(1, 0, 1, 0),
  },
  drawerPaper: {
    width: theme.menu.drawer.width,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: theme.menu.drawer.width
  },
  appName: {
    color: theme.palette.secondary.main,
    textTransform: "none",
    fontSize: theme.typography.title.fontSize
  },
  appVersionsBox: {
    padding: 0,
    margin: 0,
    minWidth: theme.typography.title.fontSize / 2,
  },
  appVersions: {
    color: theme.palette.secondary.main,
    fontSize: theme.typography.title.fontSize / 2,
    verticalAlign: "text-bottom",
    marginRight: theme.spacing(2)
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing(9),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 10),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200
      }
    }
  }
});

class AppWrapper extends Component {

  state = { open: false }

  isAppBarMenu = () => {
    return this.props.theme.menu.variant.toUpperCase() === 'APPBAR';
  }

  isShifted = () => {
    return this.state.open && this.props.theme.breakpoints.up('md');
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { history, classes, modulesManager, ...others } = this.props;
    const { open } = this.state;

    return (
      <Router history={history}>
        <Fragment>
          <AppBar
            position="fixed"
            className={classNames(classes.appBar, {
              [classes.appBarShift]: this.isShifted()
            })}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                onClick={this.handleOpen}
                className={classNames(classes.menuButton,
                  this.isAppBarMenu() && classes.autoHideMenuButton,
                  open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Button
                className={classes.appName}
                onClick={e => history.push("/home")}>
                {this.isAppBarMenu() && (
                  <Hidden smDown implementation="css">
                    <img className={classes.logo} src={this.props.logo} />
                  </Hidden>
                )}
                <FormattedMessage module="core" id="appName"
                  defaultMessage={<FormattedMessage id="root.appName" />} />
              </Button>
              <Hidden smDown implementation="css">
                <Tooltip title={modulesManager.getModulesVersions().join(", ")}>
                  <Typography variant="caption" className={classes.appVersions}>
                    {modulesManager.getOpenIMISVersion()}
                  </Typography>
                </Tooltip>
              </Hidden>
              {this.isAppBarMenu() && (
                <Hidden smDown implementation="css">
                  <Contributions
                    {...others}
                    menuVariant='AppBar'
                    contributionKey={MAIN_MENU_CONTRIBUTION_KEY}
                  >
                    <div onClick={this.handleClose} />
                  </Contributions>
                </Hidden>
              )}
              <Contributions
                {...others}
                contributionKey={APP_BAR_CONTRIBUTION_KEY}
              >
                <div className={classes.grow} />
              </Contributions>
              <Logout />
              <Help />
            </Toolbar>
          </AppBar>
          {open && (
            <ClickAwayListener onClickAway={this.handleClose}>
              <nav className={classes.drawer}>
                <Drawer
                  className={classes.drawer}
                  variant="persistent"
                  anchor="left"
                  open={open}
                  classes={{
                    paper: classes.drawerPaper
                  }}
                >
                  <Contributions
                    {...others}
                    contributionKey={MAIN_MENU_CONTRIBUTION_KEY}
                    menuVariant="Drawer"
                  >
                    <Divider />
                  </Contributions>
                </Drawer>
              </nav>
            </ClickAwayListener>
          )}
          <div className={classes.toolbar} />
          <main
            className={classNames(classes.content, {
              [classes.contentShift]: this.isShifted()
            })}
          >
            {this.props.children}
          </main>
        </Fragment>
      </Router >
    );
  }
}

export default withHistory(withWidth()(withTheme(withStyles(styles)(AppWrapper))));
