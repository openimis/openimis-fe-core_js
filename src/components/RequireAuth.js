import React, { useMemo } from "react";
import withWidth from "@material-ui/core/withWidth";
import { Redirect } from "../helpers/history";
import { alpha, useTheme, makeStyles } from "@material-ui/core/styles";
import { useModulesManager } from "../helpers/modules";
import LogoutButton from "./LogoutButton";
import Help from "../pages/Help";
import clsx from "clsx";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider,
  Tooltip,
  Button,
  Hidden,
  ClickAwayListener,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Contributions from "./generics/Contributions";
import FormattedMessage from "./generics/FormattedMessage";
import JournalDrawer from "./JournalDrawer";
import { useBoolean, useAuthentication } from "../helpers/hooks";

export const APP_BAR_CONTRIBUTION_KEY = "core.AppBar";
export const MAIN_MENU_CONTRIBUTION_KEY = "core.MainMenu";
export const MAIN_SEARCHER_CONTRIBUTION_KEY = "core.MainSearcher";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  logo: {
    verticalAlign: "middle",
    margin: theme.typography.title.fontSize / 2,
    maxHeight: theme.typography.title.fontSize * 2,
  },
  appBar: {
    paddingRight: theme.jrnlDrawer.close.width,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${theme.menu.drawer.width})`,
    marginLeft: theme.menu.drawer.width,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    margin: theme.spacing(0, 1, 0, 1),
    padding: 0,
  },
  autoHideMenuButton: {
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  toolbar: {
    ...theme.mixins.toolbar,
    marginTop: theme.spacing(2),
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
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
    paddingRight: theme.jrnlDrawer.close.width - theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: theme.menu.drawer.width,
  },
  appName: {
    color: theme.palette.secondary.main,
    textTransform: "none",
    fontSize: theme.typography.title.fontSize,
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
    marginRight: theme.spacing(2),
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    width: theme.spacing(9),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 10),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200,
      },
    },
  },
}));

const RequireAuth = (props) => {
  const { children, logo, redirectTo, ...others } = props;
  const [isOpen, setOpen] = useBoolean();
  const [isDrawerOpen, setDrawerOpen] = useBoolean();
  const theme = useTheme();
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const auth = useAuthentication();

  const isAppBarMenu = useMemo(() => theme.menu.variant.toUpperCase() === "APPBAR", [theme.menu.variant]);

  if (!auth.isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: isOpen && theme.breakpoints.up("md"),
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={setOpen.toggle}
            className={clsx(classes.menuButton, isAppBarMenu && classes.autoHideMenuButton, isOpen && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Button className={classes.appName} onClick={(e) => (window.location.href = "/front")}>
            {isAppBarMenu && (
              <Hidden smDown implementation="css">
                <img className={classes.logo} src={logo} />
              </Hidden>
            )}
            <FormattedMessage module="core" id="appName" defaultMessage={<FormattedMessage id="root.appName" />} />
          </Button>
          <Hidden smDown implementation="css">
            <Tooltip title={modulesManager.getModulesVersions().join(", ")}>
              <Typography variant="caption" className={classes.appVersions}>
                {modulesManager.getOpenIMISVersion()}
              </Typography>
            </Tooltip>
          </Hidden>
          {isAppBarMenu && (
            <Hidden smDown implementation="css">
              <Contributions {...others} menuVariant="AppBar" contributionKey={MAIN_MENU_CONTRIBUTION_KEY}>
                <div onClick={setOpen.off} />
              </Contributions>
            </Hidden>
          )}
          <Contributions {...others} contributionKey={APP_BAR_CONTRIBUTION_KEY}>
            <div className={classes.grow} />
          </Contributions>
          <LogoutButton />
          <Help />
        </Toolbar>
      </AppBar>
      {isOpen && (
        <ClickAwayListener onClickAway={setOpen.off}>
          <nav className={classes.drawer}>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={isOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <Contributions {...others} contributionKey={MAIN_MENU_CONTRIBUTION_KEY} menuVariant="Drawer">
                <Divider />
              </Contributions>
            </Drawer>
          </nav>
        </ClickAwayListener>
      )}
      <JournalDrawer open={isDrawerOpen} handleDrawer={setDrawerOpen.toggle} />
      <div className={classes.toolbar} />
      <main
        className={clsx(classes.content, {
          [classes.jrnlContentShift]: isDrawerOpen,
        })}
      >
        {children}
      </main>
    </>
  );
};

export default withWidth()(RequireAuth);
