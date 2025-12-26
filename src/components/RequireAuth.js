import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  AppBar,
  Button,
  ClickAwayListener,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { useGraphqlQuery } from "@openimis/fe-core";
import clsx from "clsx";
import { useIdleTimer } from "react-idle-timer/dist/index.legacy.cjs.js"; // otherwise not building: https://github.com/SupremeTechnopriest/react-idle-timer/issues/350
import { useDispatch, useSelector } from "react-redux";
import { CheckAssignedProfile, logout } from "../actions";
import { Redirect } from "../helpers/history";
import { useAuthentication, useBoolean } from "../helpers/hooks";
import { useModulesManager } from "../helpers/modules";
import NotificationDialog from "./dialogs/NotificationDialog";
import GedAlertBanner from "./GedAlertBanner";
import Contributions from "./generics/Contributions";
import PageTitle from "./hooks/pageTitle";
import JournalDrawer from "./JournalDrawer";
import LogoutButton from "./LogoutButton";
import OdooAlertBanner from "./OdooAlertBanner";
// npm i cookie_js
import cookie from "cookie_js";

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
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 159, 28, 0.2)",
    },
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
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 159, 28, 0.2)",
    },
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
  iconContainer: {
    position: "relative",
    cursor: "pointer",
    margin: "3px 9px 0 0",
    padding: "8px",
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 159, 28, 0.2)",
    },
  },
  iconBtn: {
    position: "absolute",
    top: "-.5rem",
    right: ".8rem",
    padding: theme.spacing(1.6),
    width: "1.1rem",
    // width: "15px",
    height: "1.1rem",
    background: "red",
    borderRadius: "50%",
    marginBottom: "20px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const RequireAuth = (props) => {
  // let { hideMenuNavigation } = useParams();
  let query = useQuery();
  const { children, logo, redirectTo, ...others } = props;
  const [isOpen, setOpen] = useBoolean();
  const [isDrawerOpen, setDrawerOpen] = useBoolean();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const auth = useAuthentication();
  const [searchString, setSearchString] = useState();
  const [hideMenu, setHideMenu] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, data, error } = useGraphqlQuery(
    `
    query ApproverFamiliesCount {
      approverFamiliesCount {
          approverFamiliesCount
      }
  }
  `,
    { str: searchString },
  );

  useEffect(() => {
    if (query.get("hideMenuNavigation")) {
      setHideMenu(true);
    }

    if (query.get("jwt")) {
      cookie.set("JWT", query.get("jwt"));
    }
  }, [query]);
  useEffect(() => {
    if (!!data) {
      dispatch({ type: "INSUREE_COUNT_RESP", payload: data });
    }
  }, [data]);

  const getNotification = useSelector((store) => store.core);

  const bellIcon = (event) => {
    if (anchorEl) {
      setAnchorEl(null); // Close the dialog if it's already open
    } else {
      setAnchorEl(event.currentTarget); // Open the dialog if it's closed
    }
    // if (data?.approverFamiliesCount?.approverFamiliesCount > 0) {
    //   historyPush(modulesManager, props.history, "insuree.route.pendingApproval");
    // }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const isAppBarMenu = useMemo(() => theme.menu.variant.toUpperCase() === "APPBAR", [theme.menu.variant]);
  const idleTimeSet = 30 * 60 * 1000;
  console.log("process.env.REACT_APP_IDLE_LOGOUT_TIME", Math.floor(process.env.REACT_APP_IDLE_LOGOUT_TIME));
  const idleTimeout = modulesManager.getConf("fe-core", "auth.idleTimeout", Math.floor(idleTimeSet)); // TODO: fix modulesManager - is always empty at this stage, so always using default value
  const onIdle = async () => {
    const userid = localStorage.getItem("userId");
    const response = await dispatch(CheckAssignedProfile(userid));
    if (!!response.payload.data.checkAssignedProfiles.status) {
      await dispatch(logout());
    }
    // history.push("/");
  };
  const { startIdleTimer } = useIdleTimer({
    onIdle: onIdle,
    timeout: idleTimeout,
    throttle: 500,
  });
  useEffect(() => {
    startIdleTimer;
  }, [startIdleTimer]);

  if (!auth.isAuthenticated) {
    sessionStorage.setItem("session_expired", "1");
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      {!hideMenu && (
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
                CAMU
              </Button>
              <Hidden smDown implementation="css">
                <Tooltip title={modulesManager.getModulesVersions().join(", ")}>
                  <Typography variant="caption" className={classes.appVersions}>
                    {/* {modulesManager.getOpenIMISVersion()} */}
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
                <div onClick={bellIcon} className={classes.iconContainer}>
                  <div>
                    <div className={classes.iconBtn}>{getNotification?.notificationListTotalCount}</div>
                    <NotificationsIcon />
                  </div>
                </div>
              </Contributions>

              <LogoutButton />
              {/* <Help /> */}
            </Toolbar>
          </AppBar>
        </>
      )}
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
      {!hideMenu && <JournalDrawer open={isDrawerOpen} handleDrawer={setDrawerOpen.toggle} />}
      {!hideMenu && <div className={classes.toolbar} />}
      <main
        className={clsx(classes.content, {
          [classes.jrnlContentShift]: isDrawerOpen,
        })}
      >
        <GedAlertBanner />
        <OdooAlertBanner />
        {!hideMenu && <PageTitle />}
        {children}
      </main>
      <NotificationDialog
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        notificationData={getNotification?.notificationList}
        modulesManager={modulesManager}
        history={props.history}
      />
    </>
  );
};

export default withWidth()(RequireAuth);
