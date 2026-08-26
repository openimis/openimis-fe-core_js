import React, { Component, Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import GetIconComponent from "../../helpers/icons";

const ExpandMoreIcon = GetIconComponent("ExpandMore");
import Typography from "@mui/material/Typography";
import { styled, alpha } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  Divider,
  List,
  IconButton,
  MenuList,
  MenuItem,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Box,
} from "@mui/material";
import withModulesManager from "../../helpers/modules";
import { menuEntryMatchesLocationPath, isMenuGroup, getMenuGroupChildren } from "../../helpers/utils";

// Renders a menu icon that may be a component reference or an already-built element.
const renderMenuIcon = (icon) => {
  if (typeof icon !== "function") return icon;
  const Icon = icon;
  return <Icon />;
};

// Stable React key for a prepared entry: its id, else its route, else its label;
// the index only disambiguates duplicated entries, so reordering a list cannot
// rebind a submenu's local state.
const menuEntryKey = (entry, idx) =>
  `${entry.id || entry.route || (typeof entry.text === "string" ? entry.text : "item")}_${idx}`;

// AppBar rendering: entries are plain links, groups open a lateral flyout with
// their children (recursive). Keyboard: Enter/Space toggle a group, ArrowRight
// opens it and focuses its first child, ArrowLeft/Escape close it and return the
// focus to the group, while the up/down arrows are handled by the MenuList.
function SubmenuFlyout({ entry, depth, onNavigate }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  // Set when the flyout has to be focused as soon as it is mounted, i.e. when
  // ArrowRight opens a closed submenu.
  const pendingFocusRef = useRef(false);
  const isGroup = isMenuGroup(entry);

  useEffect(() => {
    if (open && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      anchorRef.current?.querySelector('[role="menuitem"]')?.focus();
    }
  }, [open]);

  const closeFlyout = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setOpen(false);
    anchorRef.current?.focus();
  };

  if (!isGroup) {
    return (
      <Fragment>
        <MenuItem
          component={Link}
          to={entry.route}
          onClick={(event) => onNavigate(event, entry.route)}
          sx={{ pl: 2 + depth * 2 }}
        >
          <ListItemIcon>{renderMenuIcon(entry.icon)}</ListItemIcon>
          <ListItemText primary={entry.text} />
        </MenuItem>
        {entry.withDivider && <Divider className="drawerDivider" />}
      </Fragment>
    );
  }

  // Enter/Space already toggle the group (MUI's ButtonBase turns them into a
  // click) and the surrounding MenuList already moves the focus between items
  // with the up/down arrows, so only the lateral navigation is handled here.
  const handleTriggerKeyDown = (event) => {
    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        event.stopPropagation();
        // Focus right away when the flyout is already mounted, otherwise let the
        // effect above do it once it is.
        const firstChild = anchorRef.current?.querySelector('[role="menuitem"]');
        if (firstChild) {
          firstChild.focus();
        } else if (!open) {
          // Only a closed flyout is going to be mounted by this call, so the
          // pending flag can never survive while the flyout is already open.
          pendingFocusRef.current = true;
        }
        setOpen(true);
        break;
      }
      case "ArrowLeft":
      case "Escape":
        if (open) {
          closeFlyout(event);
        }
        break;
      default:
        break;
    }
  };

  const handleFlyoutKeyDown = (event) => {
    if (event.key === "Escape" || event.key === "ArrowLeft") {
      closeFlyout(event);
    }
  };

  return (
    <MenuItem
      ref={anchorRef}
      onClick={() => setOpen((previous) => !previous)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={handleTriggerKeyDown}
      selected={open}
      aria-haspopup="menu"
      aria-expanded={open}
      sx={{ pl: 2 + depth * 2 }}
    >
      <ListItemIcon>{renderMenuIcon(entry.icon)}</ListItemIcon>
      <ListItemText primary={entry.text} />
      <ExpandMoreIcon style={{ transform: "rotate(-90deg)", fontSize: 16 }} />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="right-start"
        disablePortal
        style={{ zIndex: 2100 + depth }}
      >
        <Paper className="appBarMenuPaper">
          <MenuList onKeyDown={handleFlyoutKeyDown}>
            {getMenuGroupChildren(entry).map((child, childIdx) => (
              <SubmenuFlyout
                key={menuEntryKey(child, childIdx)}
                entry={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </MenuItem>
  );
}

// Drawer rendering: groups expand in place with their children (recursive),
// leaves navigate. Group triggers are buttons, so Enter/Space work natively, and
// the `withDivider` flag of every leaf (whatever its depth) still renders its
// divider.
function SubmenuDrawer({ entry, depth, onNavigate }) {
  const [open, setOpen] = useState(false);
  const isGroup = isMenuGroup(entry);

  if (!isGroup) {
    const isActive = menuEntryMatchesLocationPath(entry);
    return (
      <Fragment>
        <ListItem
          component={Link}
          to={entry.route}
          onClick={onNavigate}
          selected={isActive}
          className={isActive ? "menuItemActive" : undefined}
          sx={{ pl: 2 + depth * 2 }}
        >
          {entry.icon && <ListItemIcon>{renderMenuIcon(entry.icon)}</ListItemIcon>}
          <ListItemText primary={entry.text} />
        </ListItem>
        {entry.withDivider && <Divider className="drawerDivider" />}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <ListItemButton
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        sx={{ pl: 2 + depth * 2 }}
      >
        {entry.icon && <ListItemIcon>{renderMenuIcon(entry.icon)}</ListItemIcon>}
        <ListItemText primary={entry.text} />
        <ExpandMoreIcon style={{ transform: open ? "rotate(180deg)" : undefined }} />
      </ListItemButton>
      {open && (
        <List component="div" disablePadding>
          {getMenuGroupChildren(entry).map((child, childIdx) => (
            <SubmenuDrawer
              key={menuEntryKey(child, childIdx)}
              entry={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      )}
    </Fragment>
  );
}

const StyledMainMenu = styled("div")(({ theme }) => ({
  "& .panel": {
    margin: "0 !important",
    padding: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.05),
    },
    "& .MuiAccordionSummary-root": {
      padding: theme.spacing(0, 2),
    },
  },
  "& .drawerHeading": {
    fontSize: theme.menu.drawer.fontSize,
    fontWeight: 500,
    color: theme.palette.secondary.main,
  },
  "& .MuiAccordionSummary-root .MuiListItemIcon-root": {
    color: "inherit",
    minWidth: 40,
  },

  "& .MuiAccordionDetails-root": {
    backgroundColor: theme.palette.secondary.main,
    "& .MuiListItem-root": {
      color: theme.palette.text.secondary,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
      "&.Mui-selected, &.menuItemActive": {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.16),
        },
      },
    },
    "& .MuiListItemButton-root": {
      color: theme.palette.text.secondary,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.text.secondary,
      minWidth: 40,
    },
    "& .MuiListItemText-root .MuiTypography-root": {
      color: theme.palette.text.secondary,
    },
  },
  "& .MuiAccordionSummary-expandIconWrapper span": {
    color: "inherit",
  },
  "& .drawerDivider": {
    // width: 100
  },
  "& .menuHeading": {
    fontSize: (theme.menu?.appBar?.fontSize || 14) + 1,
    fontWeight: 500,
    color: theme.palette.secondary.main,
    textTransform: "none",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1.2,
    padding: theme.spacing(1, 1.8),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
  },
  "& .menuHeading .MuiListItemIcon-root": {
    color: "inherit",
    minWidth: 0,
    marginRight: theme.spacing(0.75),
  },
  "& .appBarMenuPaper": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  "& .popper": {
    zIndex: 1500,
  },

  "& .appBarMenuPaper .MuiListItemText-primary": {
    color: theme.palette.text.primary,
  },
  "& .appBarMenuPaper .MuiListItemIcon-root": {
    color: theme.palette.text.primary,
  },
}));

const Accordion = styled(MuiAccordion)({
  boxShadow: "none",
  margin: 0,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: 0,
  },
});

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.secondary.main,
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56,
  },
  "& .MuiAccordionSummary-content": {
    margin: 0,
    padding: 0,
    alignItems: "center",
    justifyContent: "start",
    color: theme.palette.secondary.main,
    "&.Mui-expanded": {
      margin: 0,
    },
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
  display: "block",
}));

function fetchSubmenuConfig(modulesManager, allEntries, entries, menuId, rights) {
  const menuConfig = modulesManager.getConf("fe-core", "menus", []);
  if (!Array.isArray(menuConfig)) {
    console.error("Malformed fe-core menus config: expected array, got", menuConfig);
    return []; // Fallback to empty
  }
  const isMenuConfigEmpty = !menuConfig.length;
  const submenuMapping = {};
  const menuIcons = {};
  const copyOfEntries = entries;

  if (!isMenuConfigEmpty) {
    menuConfig
      .filter((menu) => menu.id == menuId)
      .forEach((menu) => {
        (menu.submenus || []).forEach((submenu) => {
          submenuMapping[submenu.id] = submenu.position;
          if (submenu.icon) {
            menuIcons[submenu.id] = submenu.icon;
          }
        });
      });

    let updatedEntries = allEntries
      .map((entry) => {
        const customIcon = menuIcons[entry.id];
        return {
          ...entry,
          position: submenuMapping[entry.id] || null,
          icon: customIcon ? GetIconComponent(customIcon) : entry.icon || GetIconComponent(null),
        };
      })
      .filter((entry) => entry.position !== null)
      .sort((a, b) => (a.position || 99) - (b.position || 99));

    // If no submenus processed, check for direct entries in the menu config
    if (updatedEntries.length === 0) {
      const menuWithEntries = menuConfig.find((m) => m.id === menuId && m.entries);
      if (menuWithEntries) {
        updatedEntries = menuWithEntries.entries
          .filter((entry) => !entry.filter || entry.filter(rights))
          .map((entry) => ({
            ...entry,
            icon: entry.icon ? GetIconComponent(entry.icon) : GetIconComponent(null),
          }));
      }
    }

    const uniqueEntries = new Map();
    updatedEntries.forEach((entry) => {
      if (!uniqueEntries.has(entry.id)) {
        uniqueEntries.set(entry.id, entry);
      }
    });

    return Array.from(uniqueEntries.values());
  }

  const uniqueEntriesFallback = new Map();
  copyOfEntries.forEach((entry) => {
    if (!uniqueEntriesFallback.has(entry.id)) {
      uniqueEntriesFallback.set(entry.id, entry);
    }
  });

  return Array.from(uniqueEntriesFallback.values());
}

class MainMenuContribution extends Component {
  state = {
    expanded: this.props.isInitiallyOpen || false,
    anchorRef: React.createRef(),
  };

  toggleExpanded = (event) => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleMenuClose = (event) => {
    if (this.state.anchorRef.current && this.state.anchorRef.current.contains(event.target)) {
      return;
    }
    this.toggleExpanded(event);
  };

  handleMenuKeyDown = (event) => {
    if (event.key === "Escape") {
      this.toggleExpanded(event);
    }
  };

  handleMenuSelect = (e, route) => {
    if (e.type === "click") {
      e.stopPropagation();
      e.preventDefault();
    }
    this.toggleExpanded(e);
    this.props.history.push(route);
  };

  appBarMenu = (entries) => {
    const { intl } = this.props;

    return (
      <StyledMainMenu>
        <Button ref={this.state.anchorRef} onClick={this.toggleExpanded} className="menuHeading">
          {(this.props.mainMenuVariant === "icon" || this.props.mainMenuVariant === "icon_text") && this.props.icon && (
            <ListItemIcon>{renderMenuIcon(this.props.icon)}</ListItemIcon>
          )}
          {(this.props.mainMenuVariant === "text" || this.props.mainMenuVariant === "icon_text") && this.props.header}
        </Button>
        <Popper
          className="popper"
          open={this.state.expanded}
          anchorEl={this.state.anchorRef.current}
          placement="bottom-start"
          disablePortal={false}
          style={{ zIndex: 2000 }}
        >
          <Paper className="appBarMenuPaper" id={`${this.props.header}-menu-list`}>
            <ClickAwayListener onClickAway={this.handleMenuClose}>
              <MenuList onKeyDown={this.handleMenuKeyDown}>
                {entries.map((entry, idx) => (
                  <SubmenuFlyout
                    key={`${this.props.header}_${menuEntryKey(entry, idx)}`}
                    entry={entry}
                    depth={0}
                    onNavigate={(event, route) => this.handleMenuSelect(event, route)}
                  />
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popper>
      </StyledMainMenu>
    );
  };

  drawerMenu = (entries) => {
    const { intl } = this.props;

    return (
      <StyledMainMenu>
        <Accordion className="panel" expanded={this.state.expanded} onChange={this.toggleExpanded}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${this.props.header}-header`}>
            <Box display="flex" alignItems="center">
              {this.props.icon && <ListItemIcon>{renderMenuIcon(this.props.icon)}</ListItemIcon>}
              <Typography className="drawerHeading">{this.props.header}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List component="nav">
              {entries.map((entry, idx) => (
                <SubmenuDrawer
                  key={`${this.props.header}_${menuEntryKey(entry, idx)}`}
                  entry={entry}
                  depth={0}
                  onNavigate={this.toggleExpanded}
                />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </StyledMainMenu>
    );
  };

  render() {
    const { menuVariant, entries } = this.props;
    // Don't render empty menus
    if (!entries || entries.length === 0) {
      return null;
    }
    if (menuVariant === "AppBar") {
      return this.appBarMenu(entries);
    } else {
      return this.drawerMenu(entries);
    }
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.array,
  history: PropTypes.object.isRequired,
  menuId: PropTypes.string.isRequired,
  contributionKey: PropTypes.string,
  mainMenuEntryVariant: PropTypes.oneOf(["icon", "text", "icon_text"]),
};

export { StyledMainMenu };
export default injectIntl(withModulesManager(MainMenuContribution));
