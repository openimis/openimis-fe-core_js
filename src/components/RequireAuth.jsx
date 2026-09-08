import React, { useMemo } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Redirect, useHistory } from "../helpers/history";
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
  ClickAwayListener,
  Box,
} from "@mui/material";
import GetIconComponent from "../helpers/icons";
const MenuIcon = GetIconComponent("Menu");
import { prepareMenuEntries } from "../helpers/utils";
import Contributions from "./generics/Contributions";
import AppBarIconButton from "./AppBarIconButton";
import FormattedMessage from "./generics/FormattedMessage";
import MainMenuBar from "./MainMenuBar";
import JournalDrawer from "./JournalDrawer";
import { useBoolean, useAuthentication } from "../helpers/hooks";
import LanguageQuickPicker from "../pickers/LanguageQuickPicker";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Switch } from "@mui/material";
import { useTranslations } from "../helpers/i18n";
import { DEFAULT, RIGHT_USERS } from "../admin/constants";
import { useDispatch, useSelector } from "react-redux";
import UserPicker from "../admin/components/pickers/UserPicker";
import { impersonateUser, stopImpersonation } from "../actions";
import { injectIntl } from "react-intl";

export const APP_BAR_CONTRIBUTION_KEY = "core.AppBar";
export const APP_BAR_ICONS_CONTRIBUTION_KEY = "core.AppBarIcons";
export const MAIN_MENU_CONTRIBUTION_KEY = "core.MainMenu";
export const MAIN_SEARCHER_CONTRIBUTION_KEY = "core.MainSearcher";
export const ECONOMIC_UNIT_BUTTON_CONTRIBUTION_KEY = "policyholder.EconomicUnitChangeButton";

const StyledRequireAuth = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  "& .layoutWrapper": {
    display: "flex",
    flex: 1,
    position: "relative",
  },
  "& .grow": {
    flexGrow: 1,
  },
  "& .logo": {
    verticalAlign: "middle",
    marginRight: theme.spacing(2),
    maxHeight: 32,
  },
  "& .appBar": {
    overflow: "visible",
    zIndex: theme.zIndex.appBar,
    minHeight: "auto",
    position: "sticky",
    top: 0,
  },
  "& .topToolbar": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(2),
    paddingRight: `calc(${theme.spacing(2)} + ${
      typeof theme.jrnlDrawer?.close?.width === "number"
        ? `${theme.jrnlDrawer.close.width}px`
        : theme.jrnlDrawer?.close?.width || "73px"
    })`,
    minHeight: "64px !important",
    flexWrap: "nowrap",
    gap: theme.spacing(1),
    position: "relative",
    zIndex: 2,
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "&.journalOpen": {
      paddingRight: theme.spacing(2),
      transition: theme.transitions.create("padding-right", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    [theme.breakpoints.down("sm")]: {
      paddingRight: `calc(${theme.spacing(2)} + ${
        typeof theme.jrnlDrawer?.close?.width === "number"
          ? `${theme.jrnlDrawer.close.width}px`
          : theme.jrnlDrawer?.close?.width || "73px"
      })`,
      "&.journalOpen": {
        paddingRight: theme.spacing(2),
      },
    },
  },
  "& .menuToolbar": {
    minHeight: "auto !important",
    paddingLeft: theme.spacing(2),
    paddingRight: `calc(${theme.spacing(2)} + ${
      typeof theme.jrnlDrawer?.close?.width === "number"
        ? `${theme.jrnlDrawer.close.width}px`
        : theme.jrnlDrawer?.close?.width || "73px"
    })`,
    backgroundColor: theme.palette.primary.main,
    borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    position: "relative",
    zIndex: 1,
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "&.journalOpen": {
      paddingRight: theme.spacing(2),
      transition: theme.transitions.create("padding-right", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  "& .appBarDrawer": {
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    zIndex: theme.zIndex.appBar,
    minHeight: "auto",
    position: "sticky",
    top: 0,
  },

  "& .toolbarDrawer": {
    color: theme.palette.secondary.main,
    paddingRight: `calc(${theme.spacing(2)} + ${
      typeof theme.jrnlDrawer?.close?.width === "number"
        ? `${theme.jrnlDrawer.close.width}px`
        : theme.jrnlDrawer?.close?.width || "73px"
    })`,
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "&.journalOpen": {
      paddingRight: `calc(${theme.spacing(2)} + ${
        typeof theme.jrnlDrawer?.close?.width === "number"
          ? `${theme.jrnlDrawer.close.width}px`
          : theme.jrnlDrawer?.close?.width || "73px"
      })`,
      transition: theme.transitions.create("padding-right", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  },

  "& .toolbarDrawerLogout": {
    color: theme.palette.text.primary,
    button: {
      margin: theme.spacing(2),
      color: theme.palette.text.primary,
    },
  },

  "& .menuButton": {
    margin: theme.spacing(0, 1, 0, 1),
    padding: 0,
  },
  "& .hide": {
    display: "none",
  },
  "& .drawerRoot": {
    [theme.breakpoints.up("sm")]: {
      width: theme.menu.drawer.width,
      flexShrink: 0,
    },
  },
  "& .drawerPaper": {
    width: theme.menu.drawer.width,
    flexShrink: 0,
    backgroundColor: theme.menu.drawer.backgroundColor,
    color: theme.menu.drawer.textColor,
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: theme.zIndex.appBar + 1,
  },

  "& .drawerHeader": {
    ...theme.mixins.toolbar,
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(1, 0, 1, 0),
    backgroundColor: theme.menu.drawer.backgroundColor,
  },
  "& .content": {
    flexGrow: 1,
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(3),
    paddingRight: `calc(${theme.spacing(3)} + ${
      typeof theme.jrnlDrawer?.close?.width === "number"
        ? `${theme.jrnlDrawer.close.width}px`
        : theme.jrnlDrawer?.close?.width || "73px"
    })`,
    transition: theme.transitions.create(["margin", "padding-right"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(2),
    },
  },
  "& .contentShift": {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: theme.menu.drawer.width,
  },
  "& main": {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& > *": {
      width: "100%",
      padding: "0 !important",
    },
  },
  "& .appName": {
    ...theme.mixins.toolbar,
    color: theme.palette.secondary.main,
    textTransform: "none",
    fontSize: theme.typography.h6.fontSize,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
  },
  "& .appNameText": {
    [theme.breakpoints.down("lg")]: {
      display: "none",
    },
  },
  "& .appVersions": {
    color: theme.palette.secondary.main,
    fontSize: theme.typography.h6.fontSize / 2,
    verticalAlign: "text-bottom",
    marginLeft: theme.spacing(1),
    opacity: 0.8,
    [theme.breakpoints.down("lg")]: {
      display: "none",
    },
  },
  "& .drawerContainer": {
    overflow: "auto",
  },
  "& .contentShiftLeftSideMenu": {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    marginRight: theme.jrnlDrawer?.close?.width || 73,
    padding: theme.spacing(3),
  },
  "& .jrnlContentShift": {
    position: "relative",
    zIndex: 1,
    paddingTop: theme.spacing(4),
    paddingRight: theme.spacing(3),
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}));

const RequireAuth = (props) => {
  const {
    children,
    logo,
    disableTextLogo,
    redirectTo,
    isSecondaryCalendar,
    setSecondaryCalendar,
    onEconomicDialogOpen,
    intl,
    ...others
  } = props;
  const rights = children.props.userRights;
  const [isOpen, setOpen] = useBoolean();
  const [isDrawerOpen, setDrawerOpen] = useBoolean();
  const theme = useTheme();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const auth = useAuthentication();
  const cfg = children.props.modulesManager.cfg;
  const menuLeft =
    modulesManager.getConf("openimis-fe-core_js", "menuLeft") || modulesManager.getConf("fe-core", "menuLeft") || false;
  const calendarSwitch = modulesManager.getConf("fe-core", "allowSecondCalendar", false);
  const showJournalSidebar = modulesManager.getConf("fe-core", "showJournalSidebar", DEFAULT.SHOW_JOURNAL_SIDEBAR);

  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const isAppBarMenu = useMemo(() => {
    const variant = theme.menu?.variant || "AppBar";
    return typeof variant === "string" && variant.trim().toUpperCase() === "APPBAR";
  }, [theme.menu?.variant]);

  const dispatch = useDispatch();
  const impersonatedUser = useSelector((state) => state.core.impersonatedUser);
  const showImpersonationPicker = auth.user?.is_superuser || Boolean(impersonatedUser);

  const preparedIcons = useMemo(() => {
    const rightsSet = new Set(rights.map((r) => String(r)));
    const routes = modulesManager.getRoutes();
    let iconsEntries = modulesManager.getContribs("core.AppBarIcons");
    const backendAppBarIconsConfig = modulesManager.getConf("fe-core", "menus", []);
    if (backendAppBarIconsConfig.length > 0) {
      // Merge backend entries with module contribs, backend overrides by id
      iconsEntries = (backendAppBarIconsConfig.find((config) => config.id === "core.AppBarIcons") || {})?.entries || [];
    }
    // Sort by position
    return prepareMenuEntries(
      rights,
      intl,
      iconsEntries.sort((a, b) => (a.position || 99) - (b.position || 99)),
      routes,
    );
  });

  if (!auth.isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  if (menuLeft) {
    return (
      <StyledRequireAuth>
        <AppBar className="appBarDrawer">
          <Toolbar className="toolbarDrawer">
            <Contributions {...others} contributionKey={APP_BAR_CONTRIBUTION_KEY}>
              <div className="grow" />
            </Contributions>
            {showImpersonationPicker && (
              <UserPicker
                readOnly={Boolean(impersonatedUser)}
                onChange={(user) => {
                  if (!user) {
                    dispatch(stopImpersonation());
                  } else if (!impersonatedUser) {
                    dispatch(impersonateUser(user));
                  }
                }}
                value={impersonatedUser}
                withLabel={false}
                placeholder="Impersonate user"
                multiple={false}
              />
            )}
            <LogoutButton className="toolbarDrawerLogout" />
            <Help />
          </Toolbar>
        </AppBar>
        <Box className="layoutWrapper">
          <Drawer className="drawerRoot" variant="permanent" PaperProps={{ className: "drawerPaper" }} anchor="left">
            <Button className="appName" onClick={() => (window.location.href = "/front")}>
              {isAppBarMenu && isSmUp && <img className="logo" src={logo} alt="Logo" />}
              {!disableTextLogo && (
                <FormattedMessage module="core" id="appName" defaultMessage={<FormattedMessage id="root.appName" />} />
              )}
              {isSmUp && (
                <Tooltip title={modulesManager.getModulesVersions().join(", ")}>
                  <Typography variant="caption" className="appVersions">
                    {modulesManager.getOpenIMISVersion()}
                  </Typography>
                </Tooltip>
              )}
            </Button>
            <div className="drawerContainer"></div>
            <MainMenuBar {...others} menuVariant="Drawer" contributionKey={MAIN_MENU_CONTRIBUTION_KEY}>
              <Divider />
            </MainMenuBar>
            <div />
          </Drawer>
          <main className="contentShiftLeftSideMenu">{children}</main>
          {showJournalSidebar && <JournalDrawer open={isDrawerOpen} handleDrawer={setDrawerOpen.toggle} />}
        </Box>
      </StyledRequireAuth>
    );
  }

  const { formatMessage } = useTranslations("core", modulesManager);
  return (
    <StyledRequireAuth>
      <AppBar
        className={clsx("appBar", {
          appBarShift: isOpen && isMdUp,
        })}
      >
        <Toolbar className={clsx("topToolbar", { journalOpen: isDrawerOpen })}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              onClick={setOpen.toggle}
              className={clsx("menuButton", (isOpen || (isMdUp && isAppBarMenu)) && "hide")}
            >
              <MenuIcon />
            </IconButton>
            <Button className="appName" onClick={() => history.push("/")}>
              {isAppBarMenu && isSmUp && logo && <img className="logo" src={logo} alt="Logo" />}
              {!disableTextLogo && (
                <Box component="span" className="appNameText">
                  <FormattedMessage
                    module="core"
                    id="appName"
                    defaultMessage={<FormattedMessage id="root.appName" />}
                  />
                </Box>
              )}
              {isSmUp && (
                <Tooltip title={modulesManager.getModulesVersions().join(", ")}>
                  <Typography variant="caption" className="appVersions">
                    {modulesManager.getOpenIMISVersion()}
                  </Typography>
                </Tooltip>
              )}
            </Button>
          </Box>

          <Box display="flex" alignItems="center" className="grow">
            {
              <Contributions {...others} contributionKey={APP_BAR_CONTRIBUTION_KEY}>
                <div className="grow" />
              </Contributions>
            }
            {preparedIcons.map((iconProps, idx) => (
              <AppBarIconButton key={`appbar_icon_${idx}`} {...iconProps} />
            ))}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {!!calendarSwitch && (
              <FormControlLabel
                control={
                  <Switch color="secondary" checked={isSecondaryCalendar} onChange={setSecondaryCalendar.toggle} />
                }
                label={formatMessage("core.calendarSwitcher")}
                labelPlacement="start"
              />
            )}
            <LanguageQuickPicker />
            <Contributions
              contributionKey={ECONOMIC_UNIT_BUTTON_CONTRIBUTION_KEY}
              onEconomicDialogOpen={onEconomicDialogOpen}
            />
            {showImpersonationPicker && (
              <UserPicker
                readOnly={Boolean(impersonatedUser)}
                onChange={(user) => {
                  if (!user) {
                    dispatch(stopImpersonation());
                  } else if (!impersonatedUser) {
                    dispatch(impersonateUser(user));
                  }
                }}
                value={impersonatedUser}
                withLabel={false}
                placeholder="Impersonate user"
                multiple={false}
              />
            )}
            <LogoutButton />
            <Help />
          </Box>
        </Toolbar>

        {isAppBarMenu && isMdUp && (
          <Toolbar className={clsx("menuToolbar", { journalOpen: isDrawerOpen })} variant="dense">
            <MainMenuBar {...others} menuVariant="AppBar" contributionKey={MAIN_MENU_CONTRIBUTION_KEY}>
              <div onClick={setOpen.off} />
            </MainMenuBar>
          </Toolbar>
        )}
      </AppBar>

      <Box className="layoutWrapper">
        {isOpen && (
          <ClickAwayListener onClickAway={setOpen.off}>
            <nav className="drawerRoot">
              <Drawer
                className="drawerRoot"
                variant="persistent"
                anchor="left"
                open={isOpen}
                PaperProps={{ className: "drawerPaper" }}
              >
                <div className="drawerHeader">
                  <Button className="appName" onClick={() => history.push("/")}>
                    {logo && <img className="logo" src={logo} alt="Logo" />}
                    <FormattedMessage
                      module="core"
                      id="appName"
                      defaultMessage={<FormattedMessage id="root.appName" />}
                    />
                  </Button>
                </div>
                <Divider />
                <MainMenuBar {...others} menuVariant="Drawer" contributionKey={MAIN_MENU_CONTRIBUTION_KEY} />
              </Drawer>
            </nav>
          </ClickAwayListener>
        )}
        <main
          className={clsx({
            jrnlContentShift: isDrawerOpen,
            content: showJournalSidebar,
          })}
        >
          {children}
        </main>
        {showJournalSidebar && <JournalDrawer open={isDrawerOpen} handleDrawer={setDrawerOpen.toggle} />}
      </Box>
    </StyledRequireAuth>
  );
};

export default injectIntl(RequireAuth);
