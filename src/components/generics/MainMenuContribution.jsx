import React, { Component, Fragment } from "react";
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
import { menuEntryMatchesLocationPath } from "../../helpers/utils";

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
    minWidth: 40,
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
            <ListItemIcon>
              {typeof this.props.icon === "function"
                ? (() => {
                    const Icon = this.props.icon;
                    return <Icon />;
                  })()
                : this.props.icon}
            </ListItemIcon>
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
              <MenuList>
                {entries.map((entry, idx) => {
                  return (
                    <div key={`${this.props.header}_${idx}_menuItem`}>
                      <MenuItem
                        component={Link}
                        to={entry.route}
                        onClick={(e) => this.handleMenuSelect(e, entry.route)}
                      >
                        <ListItemIcon>
                          {typeof entry.icon === "function"
                            ? (() => {
                                const Icon = entry.icon;
                                return <Icon />;
                              })()
                            : entry.icon}
                        </ListItemIcon>
                        <ListItemText primary={entry.text} />
                      </MenuItem>
                      {entry.withDivider && (
                        <Divider key={`${this.props.header}_${idx}_divider`} className="drawerDivider" />
                      )}
                    </div>
                  );
                })}
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
              {this.props.icon && (
                <ListItemIcon>
                  {typeof this.props.icon === "function"
                    ? (() => {
                        const Icon = this.props.icon;
                        return <Icon />;
                      })()
                    : this.props.icon}
                </ListItemIcon>
              )}
              <Typography className="drawerHeading">{this.props.header}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List component="nav">
              {entries.map((entry, idx) => {
                return (
                  <Fragment key={`${this.props.header}_${idx}`}>
                    <ListItem
                      key={`${this.props.header}_${idx}_item`}
                      component={Link}
                      to={entry.route}
                      onClick={this.toggleExpanded}
                      selected={menuEntryMatchesLocationPath(entry)}
                      className={menuEntryMatchesLocationPath(entry) ? "menuItemActive" : undefined}
                    >
                      {entry.icon && (
                        <ListItemIcon>
                          {typeof entry.icon === "function"
                            ? (() => {
                                const Icon = entry.icon;
                                return <Icon />;
                              })()
                            : entry.icon}
                        </ListItemIcon>
                      )}
                      <ListItemText primary={entry.text} />
                    </ListItem>
                    {entry.withDivider && (
                      <Divider key={`${this.props.header}_${idx}_divider`} className="drawerDivider" />
                    )}
                  </Fragment>
                );
              })}
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
