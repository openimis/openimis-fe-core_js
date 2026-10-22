/**
 * Page layouts of RequireAuth, one per way the journal is shown. Kept apart from the
 * component so they can be checked without loading the whole app shell.
 */
import { alpha } from "@mui/material/styles";

const FLUID_PADDING_DEFAULT = { percent: 2.5, maxPx: 24 };

export const fluidPaddingX = (theme) => {
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
export const classicJournalLayout = (theme) => ({
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
export const popupJournalLayout = (theme) => ({
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

