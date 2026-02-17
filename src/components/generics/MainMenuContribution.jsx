import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import * as Icons from "@mui/icons-material";
import PropTypes from "prop-types";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    color: theme.menu.drawer.textColor,
  },

  "& .MuiListItem-root": {
    color: theme.menu.drawer.textColor,
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
  },
  "& .MuiListItemIcon-root": {
    color: theme.menu.drawer.textColor,
    minWidth: 40,
  },
  "& .MuiListItemText-root .MuiTypography-root": {
    color: theme.menu.drawer.textColor,
  },
  "& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root": {
    color: theme.menu.drawer.textColor,
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
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  "&$expanded": {
    margin: "auto",
  },
});

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.secondary.main,
  minHeight: 56,
  "&$expanded": {
    minHeight: 56,
  },
  "& .MuiAccordionSummary-content": {
    margin: "0",
    padding: "0",
    alignItems: "center",
    justifyContent: "start",
    "&$expanded": {
      margin: "0",
    },
    color: theme.palette.secondary.main,
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "block",
}));

const getIconComponent = (iconName) => {
  const IconComponent = Icons[iconName];
  if (IconComponent) {
    return <IconComponent />;
  }
  return null;
};

function fetchSubmenuConfig(modulesManager, allEntries, entries, menuId, rights) {
  const menuConfig = modulesManager.getConf("fe-core", "menus", []);
  const isMenuConfigEmpty = !menuConfig?.length;
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

    const updatedEntries = allEntries
      .map((entry) => {
        const customIcon = menuIcons[entry.id];
        return {
          ...entry,
          position: submenuMapping[entry.id] || null,
          icon: customIcon ? getIconComponent(customIcon) : entry.icon,
        };
      })
      .filter((entry) => entry.position !== null)
      .sort((a, b) => a.position - b.position);

    const uniqueEntries = new Map();
    updatedEntries.forEach((entry) => {
      if (!uniqueEntries.has(entry.id)) {
        uniqueEntries.set(entry.id, entry);
      }
    });

    return Array.from(uniqueEntries.values()).filter((entry) => {
      return !entry.filter || entry.filter(rights);
    });
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
    return (
      <StyledMainMenu>
        <Button data-cy={this.props.menuId} ref={this.state.anchorRef} onClick={this.toggleExpanded} className="menuHeading">
          {this.props.header}
          <ExpandMoreIcon />
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
                {entries.map((entry, idx) => (
                  <div key={`${this.props.header}_${idx}_menuItem`}>
                    <MenuItem component={Link} to={entry.route} onClick={(e) => this.handleMenuSelect(e, entry.route)}>
                      <ListItemIcon>{entry.icon}</ListItemIcon>
                      <ListItemText primary={entry.text} />
                    </MenuItem>
                    {entry.withDivider && (
                      <Divider key={`${this.props.header}_${idx}_divider`} className="drawerDivider" />
                    )}
                  </div>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popper>
      </StyledMainMenu>
    );
  };

  drawerMenu = (entries) => {
    return (
      <StyledMainMenu>
        <Accordion className="panel" expanded={this.state.expanded} onChange={this.toggleExpanded}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${this.props.header}-header`}>
            <Box display="flex" alignItems="center">
              <Box minWidth={40} display="flex" alignItems="center">
                {this.props.icon}
              </Box>
              <Typography className="drawerHeading">{this.props.header}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List component="nav">
              {entries.map((entry, idx) => (
                <Fragment key={`${this.props.header}_${idx}`}>
                  <ListItem
                    key={`${this.props.header}_${idx}_item`}
                    component={Link}
                    to={entry.route}
                    onClick={this.toggleExpanded}
                    selected={menuEntryMatchesLocationPath(entry)}
                  >
                    {entry.icon && <ListItemIcon>{entry.icon}</ListItemIcon>}
                    <ListItemText primary={entry.text} />
                  </ListItem>
                  {entry.withDivider && (
                    <Divider key={`${this.props.header}_${idx}_divider`} className="drawerDivider" />
                  )}
                </Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </StyledMainMenu>
    );
  };

  render() {
    const { menuVariant, modulesManager, entries, rights, menuId } = this.props;

    // Defensive checks
    if (!modulesManager) {
      console.warn("MainMenuContribution: modulesManager is not available");
      return null;
    }

    if (!entries || !Array.isArray(entries)) {
      console.warn("MainMenuContribution: entries is not a valid array");
      return null;
    }

    if (!rights || !Array.isArray(rights)) {
      console.warn("MainMenuContribution: rights is not a valid array");
      return null;
    }

    const allEntries = modulesManager.getMenuEntries();
    if (!allEntries || !Array.isArray(allEntries)) {
      console.warn("MainMenuContribution: getMenuEntries returned invalid data");
      return null;
    }

    const updatedEntries = fetchSubmenuConfig(modulesManager, allEntries, entries, menuId, rights);

    // Don't render empty menus
    if (!updatedEntries || updatedEntries.length === 0) {
      return null;
    }

    if (menuVariant === "AppBar") {
      return this.appBarMenu(updatedEntries);
    } else {
      return this.drawerMenu(updatedEntries);
    }
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  menuId: PropTypes.string.isRequired,
};

export { StyledMainMenu };
export default withModulesManager(MainMenuContribution);
