import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { fade } from "@material-ui/core/styles/colorManipulator";
import classNames from "classnames";
import kebabCase from "lodash/kebabCase";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Contributions from "./Contributions";
import history from "./history";

export const DRAWER_WIDTH = 300;
export const APP_BAR_CONTRIBUTION_KEY = "core.AppBar";
export const MAIN_MENU_CONTRIBUTION_KEY = "core.MainMenu";
export const ROUTER_CONTRIBUTION_KEY = "core.Router";
export const MAIN_SEARCHER_CONTRIBUTION_KEY = "core.MainSearcher";

const styles = theme => ({
  root: {
    display: "flex"
  },
  grow: {
    flexGrow: 1
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: DRAWER_WIDTH,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0
  },
  drawerPaper: {
    width: DRAWER_WIDTH
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: DRAWER_WIDTH
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
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
      marginLeft: theme.spacing.unit,
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
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
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
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

class CoreApp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.routerContributions = props.modulesManager.getContributions(
      ROUTER_CONTRIBUTION_KEY
    );
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, theme, ...others } = this.props;
    const { open } = this.state;

    return (
      <Router history={history}>
        <Fragment>
          <AppBar
            position="fixed"
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                color="inherit"
                noWrap
                onClick={e => history.push("/home")}
              >
                openIMIS
              </Typography>
              <Contributions
                {...others}
                contributionKey={APP_BAR_CONTRIBUTION_KEY}
              >
                <div className={classes.grow} />
              </Contributions>
            </Toolbar>
          </AppBar>

          <Fragment>
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
              >
                <div className={classes.drawerHeader} onClick={this.handleDrawerClose}/>
                <Divider />
              </Contributions>
            </Drawer>
            <main
              className={classNames(classes.content, {
                [classes.contentShift]: open
              })}
            >
              <div className={classes.drawerHeader} />
              <Switch>
                <Route exact path={`${process.env.PUBLIC_URL || ''}/`} render={() => <Redirect to={`${process.env.PUBLIC_URL || ''}/home`} />} />
                {this.routerContributions.map((route, index) => (
                  <Route
                    exact
                    key={`route_${kebabCase(route.path)}_${index}`}
                    path={`${process.env.PUBLIC_URL || ''}/${route.path}`}
                    component={route.component}
                  />
                ))}
              </Switch>
            </main>
          </Fragment>
        </Fragment>
      </Router>
    );
  }
}

CoreApp.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  modulesManager: PropTypes.object.isRequired
};

// export default withStyles(styles, { withTheme: true })(CoreApp);
export default withStyles(styles)(CoreApp);
