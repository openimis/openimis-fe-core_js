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
import { prepareMenuEntries, resolveMenuVariant } from "../helpers/utils";
import Contributions from "./generics/Contributions";
import AppBarIconButton from "./AppBarIconButton";
import FormattedMessage from "./generics/FormattedMessage";
import MainMenuBar from "./MainMenuBar";
import JournalDrawer, { JournalButtonTrigger } from "./JournalDrawer";
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

const FLUID_PADDING_DEFAULT = { percent: 2.5, maxPx: 24 };

const fluidPaddingX = (theme) => {
  const configured = theme.layout?.contentPaddingX;
  if (typeof configured === "number") {
    return theme.spacing(configured);
  }
  if (configured?.xs || configured?.sm || configured?.md) {
    return `min(${configured.md?.percent ?? FLUID_PADDING_DEFAULT.percent}%, ${configured.md?.maxPx ?? FLUID_PADDING_DEFAULT.maxPx}px)`;
  }
  const { percent, maxPx } = { ...FLUID_PADDING_DEFAULT, ...configured };
  return `min(${percent}%, ${maxPx}px)`;
};

const contentPaddingTop = (theme, size) => theme.spacing(theme.layout?.contentPaddingTop?.[size] ?? (size === "md" ? 4 : 2));

const menuDrawerBreakpointUp = (theme) => theme.breakpoints.up(theme.layout?.menuDrawerBreakpoint ?? "lg");

const fluidContentPadding = (theme) => ({
  paddingTop: contentPaddingTop(theme, "xs"),
  paddingLeft: fluidPaddingX(theme),
  paddingRight: fluidPaddingX(theme),
  [theme.breakpoints.up("md")]: {
    paddingTop: contentPaddingTop(theme, "md"),
  },
});

const journalGutter = (theme) =>
  typeof theme.jrnlDrawer?.close?.width === "number"
    ? `${theme.jrnlDrawer.close.width}px`
    : theme.jrnlDrawer?.close?.width || "73px";

/**
 * Layout used when the journal is the classic always-there right sidebar: every horizontal
 * edge keeps a gutter wide enough for the collapsed drawer, released while it is open.
 */
const classicJournalLayout = (theme) => ({
  "& .layoutWrapper": {
    display: "flex",
    flex: 1,
    position: "relative",
  },
  "& .topToolbar": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(2),
    paddingRight: `calc(${theme.spacing(2)} + ${journalGutter(theme)})`,
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
      paddingRight: `calc(${theme.spacing(2)} + ${journalGutter(theme)})`,
      "&.journalOpen": {
        paddingRight: theme.spacing(2),
      },
    },
  },
  "& .menuToolbar": {
    minHeight: "auto !important",
    paddingLeft: theme.spacing(2),
    paddingRight: `calc(${theme.spacing(2)} + ${journalGutter(theme)})`,
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
  "& .toolbarDrawer": {
    color: theme.palette.secondary.main,
    paddingRight: `calc(${theme.spacing(2)} + ${journalGutter(theme)})`,
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "&.journalOpen": {
      paddingRight: `calc(${theme.spacing(2)} + ${journalGutter(theme)})`,
      transition: theme.transitions.create("padding-right", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  },
  "& .content": {
    flexGrow: 1,
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(3),
    paddingRight: `calc(${theme.spacing(3)} + ${journalGutter(theme)})`,
    transition: theme.transitions.create(["margin", "padding-right"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(2),
    },
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
});

/**
 * Layout used when the journal is a popup drawer: nothing is reserved on the right, so the
 * content spans the full width with a fluid padding and the main menu collapses on its own
 * breakpoint.
 */
const popupJournalLayout = (theme) => ({
  "& .layoutWrapper": {
    display: "flex",
    flex: 1,
    position: "relative",
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
  },
  "& .topToolbar": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: fluidPaddingX(theme),
    paddingRight: fluidPaddingX(theme),
    minHeight: "64px !important",
    flexWrap: "nowrap",
    gap: theme.spacing(1),
    position: "relative",
    zIndex: 2,
  },
  "& .menuToolbar": {
    minHeight: "auto !important",
    paddingLeft: fluidPaddingX(theme),
    paddingRight: fluidPaddingX(theme),
    backgroundColor: theme.palette.primary.main,
    borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    position: "relative",
    zIndex: 1,
    display: "none",
    [menuDrawerBreakpointUp(theme)]: {
      display: "flex",
    },
  },
  "& .toolbarDrawer": {
    color: theme.palette.secondary.main,
    paddingLeft: fluidPaddingX(theme),
    paddingRight: fluidPaddingX(theme),
  },
  "& .content": {
    flexGrow: 1,
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    ...fluidContentPadding(theme),
    transition: theme.transitions.create(["margin", "padding-right"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  "& main": {
    flexGrow: 1,
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...fluidContentPadding(theme),
    transition: theme.transitions.create("padding-right", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "& > *": {
      width: "100%",
      maxWidth: "100%",
      padding: "0 !important",
    },
  },
  "& .contentShiftLeftSideMenu": {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    ...fluidContentPadding(theme),
  },
});

/**
 * The left menu paper, and the rules its content relies on. A temporary Drawer portals its paper
 * out of the styled wrapper, so these cannot be plain descendant rules there.
 */
const menuDrawerPaperStyles = (theme) => ({
  width: theme.menu.drawer.width,
  flexShrink: 0,
  backgroundColor: theme.menu.drawer.backgroundColor,
  color: theme.menu.drawer.textColor,
  zIndex: theme.zIndex.appBar + 1,
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
  "& .logo": {
    verticalAlign: "middle",
    marginRight: theme.spacing(2),
    maxHeight: 32,
  },
  "& .drawerContainer": {
    overflow: "auto",
  },
});

const StyledRequireAuth = styled("div", {
  shouldForwardProp: (prop) => prop !== "journalSidebar",
})(({ theme, journalSidebar }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
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
  "& .appBarDrawer": {
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    zIndex: theme.zIndex.appBar,
    minHeight: "auto",
    position: "sticky",
    top: 0,
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
    // Same inset as .topToolbar, so the drawer sandwich sits where the AppBar one was.
    paddingLeft: fluidPaddingX(theme),
    margin: theme.spacing(1, 0, 1, 0),
    backgroundColor: theme.menu.drawer.backgroundColor,
    color: theme.menu.drawer.textColor,
  },
  "& .drawerHeader .appName": {
    minWidth: 0,
    paddingLeft: 0,
  },
  "& .drawerHeader .logo": {
    maxHeight: 24,
    marginRight: theme.spacing(1),
  },
  "& .contentShift": {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: theme.menu.drawer.width,
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
  ...(journalSidebar ? classicJournalLayout(theme) : popupJournalLayout(theme)),
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
  const calendarSwitch = modulesManager.getConf("fe-core", "allowSecondCalendar", false);
  const showJournalSidebar = modulesManager.getConf("fe-core", "showJournalSidebar", DEFAULT.SHOW_JOURNAL_SIDEBAR);

  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const menuDrawerBreakpoint = theme.layout?.menuDrawerBreakpoint ?? "lg";
  const isMenuDrawerUp = useMediaQuery(theme.breakpoints.up(menuDrawerBreakpoint));
  const journalSidebarBreakpoint = theme.layout?.journalSidebarBreakpoint ?? "md";
  const isJournalSidebarUp = useMediaQuery(theme.breakpoints.up(journalSidebarBreakpoint));
  // the always-there sidebar does not fit a narrow screen: fall back to the popup journal there
  const journalSidebar = showJournalSidebar && isJournalSidebarUp;
  // the classic sidebar layout keeps the historical md breakpoint, the popup one is configurable
  const isMenuBarUp = journalSidebar ? isMdUp : isMenuDrawerUp;

  // Deprecated: superseded by theme.menu.variant, still honoured for configs that predate it.
  const legacyMenuLeft =
    modulesManager.getConf("openimis-fe-core_js", "menuLeft") || modulesManager.getConf("fe-core", "menuLeft") || false;
  const mainMenuLayout = useMemo(
    () => resolveMenuVariant(theme.menu?.variant, legacyMenuLeft),
    [theme.menu?.variant, legacyMenuLeft],
  );
  // The variant picks between the two wide layouts only. Narrower than the menu breakpoint there
  // is room for neither, so the hamburger + overlay drawer takes over whatever the config says.
  const isLeftSidebar = mainMenuLayout === "drawer" && (journalSidebar || isMenuBarUp);

  const { formatMessage } = useTranslations("core", modulesManager);

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

  const leftMenuDrawer = (
    <>
      <Button className="appName" onClick={() => (window.location.href = "/front")}>
        {isSmUp && logo && <img className="logo" src={logo} alt="Logo" />}
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
    </>
  );

  if (isLeftSidebar) {
    return (
      <StyledRequireAuth journalSidebar={journalSidebar}>
        <AppBar className="appBarDrawer">
          <Toolbar className={clsx("toolbarDrawer", { journalOpen: journalSidebar && isDrawerOpen })}>
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
            {!journalSidebar && <JournalButtonTrigger onClick={setDrawerOpen.toggle} />}
            <LogoutButton className="toolbarDrawerLogout" />
            <Help />
          </Toolbar>
        </AppBar>
        <Box className="layoutWrapper">
          <Drawer
            className="drawerRoot"
            variant="permanent"
            anchor="left"
            slotProps={{
              paper: { sx: (theme) => ({ ...menuDrawerPaperStyles(theme), position: "fixed", inset: "0 auto 0 0" }) },
            }}
          >
            {leftMenuDrawer}
          </Drawer>
          <main className="contentShiftLeftSideMenu">{children}</main>
          <JournalDrawer
            journalSidebar={journalSidebar}
            open={isDrawerOpen}
            handleDrawer={setDrawerOpen.toggle}
          />
        </Box>
      </StyledRequireAuth>
    );
  }

  return (
    <StyledRequireAuth journalSidebar={journalSidebar}>
      <AppBar
        className={clsx("appBar", {
          appBarShift: isOpen && isMenuBarUp,
        })}
      >
        <Toolbar className={clsx("topToolbar", { journalOpen: journalSidebar && isDrawerOpen })}>
          <Box display="flex" alignItems="center" minWidth={0} overflow="hidden">
            <IconButton
              color="inherit"
              onClick={setOpen.toggle}
              className={clsx("menuButton", (isOpen || isMenuBarUp) && "hide")}
            >
              <MenuIcon />
            </IconButton>
            <Button className="appName" onClick={() => history.push("/")}>
              {isSmUp && logo && <img className="logo" src={logo} alt="Logo" />}
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

          <Box display="flex" alignItems="center" className="grow" minWidth={0} overflow="hidden">
            {
              <Contributions {...others} contributionKey={APP_BAR_CONTRIBUTION_KEY}>
                <div className="grow" />
              </Contributions>
            }
            {preparedIcons.map((iconProps, idx) => (
              <AppBarIconButton key={`appbar_icon_${idx}`} {...iconProps} />
            ))}
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
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
            {!journalSidebar && <JournalButtonTrigger onClick={setDrawerOpen.toggle} />}
            <LogoutButton />
            <Help />
          </Box>
        </Toolbar>

        {isMenuBarUp && (
          <Toolbar className={clsx("menuToolbar", { journalOpen: journalSidebar && isDrawerOpen })} variant="dense">
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
                  <IconButton color="inherit" onClick={setOpen.off} className="menuButton" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
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
        <main className={clsx({ content: journalSidebar, jrnlContentShift: journalSidebar && isDrawerOpen })}>
          {children}
        </main>
        <JournalDrawer journalSidebar={journalSidebar} open={isDrawerOpen} handleDrawer={setDrawerOpen.toggle} />
      </Box>
    </StyledRequireAuth>
  );
};

export default injectIntl(RequireAuth);
