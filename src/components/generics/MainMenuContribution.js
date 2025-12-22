import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Grow,
  IconButton,
  List,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@material-ui/core";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { withStyles, withTheme } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import React, { Component, Fragment } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { _historyPush } from "../../helpers/history";
import withModulesManager from "../../helpers/modules";
import UsePageTitle from "../hooks/usePageTitle";

const styles = (theme) => ({
  panel: {
    margin: "0 !important",
    padding: 0,
  },
  drawerHeading: {
    fontSize: theme.menu.drawer.fontSize,
    color: theme.palette.text.primary,
    paddingTop: theme.menu.drawer.fontSize / 2,
  },
  drawerDivider: {
    // width: 100
  },
  menuHeading: {
    fontSize: theme.menu.appBar.fontSize,
    color: theme.palette.text.second,
    paddingTop: theme.menu.appBar.fontSize / 2,
    textTransform: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 159, 28, 0.2)",
      color: "#ff9f1c",
    },
  },
  appBarMenuPaper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  popper: {
    zIndex: 1200,
  },
});

const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
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
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    transition: "background-color 0.3s ease",
    "&$expanded": {
      minHeight: 56,
    },
    "&:hover": {
      backgroundColor: "rgba(255, 159, 28, 0.2)",
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    display: "block",
  },
}))(MuiAccordionDetails);

class MainMenuContribution extends Component {
  state = {
    expanded: false,
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
    // block normal href only for left click
    if (e.type === "click") {
      e.stopPropagation();
      e.preventDefault();
    }
    this.toggleExpanded(e);
    this.redirect(route);
  };

  redirect(route) {
    const { modulesManager, history } = this.props;
    _historyPush(modulesManager, history, route);
  }

  appBarMenu = () => {
    return (
      <Fragment>
        <ButtonMenu state={this.state} toggleExpanded={this.toggleExpanded} props={this.props} />

        <Popper
          className={this.props.classes.popper}
          open={this.state.expanded}
          anchorEl={this.state.anchorRef.current}
          transition
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper className={this.props.classes.appBarMenuPaper} id={`${this.props.header}-menu-list`}>
                <ClickAwayListener onClickAway={this.handleMenuClose}>
                  <MenuList>
                    <MenuItemsList
                      entries={this.props.entries}
                      header={this.props.header}
                      classes={this.props.classes}
                      redirect={(route) => this.handleMenuSelect({}, route)}
                      isAppBar={true}
                    />
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Fragment>
    );
  };

  drawerMenu = () => {
    return (
      <Accordion className={this.props.classes.panel} expanded={this.state.expanded} onChange={this.toggleExpanded}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${this.props.header}-header`}>
          <IconButton>{this.props.icon}</IconButton>
          <Typography className={this.props.classes.drawerHeading}>{this.props.header}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List component="nav">
            <MenuItemsList
              entries={this.props.entries}
              header={this.props.header}
              classes={this.props.classes}
              redirect={(route) => this.redirect(route)}
            />
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  render() {
    const { menuVariant } = this.props;
    if (menuVariant === "AppBar") {
      return this.appBarMenu();
    } else {
      return this.drawerMenu();
    }
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

const ButtonMenu = ({ state, toggleExpanded, props }) => {
  const page = UsePageTitle();
  const intl = useIntl();

  const translateKey = (key) => {
    if (!key) return key;
    try {
      const translated = intl.formatMessage({ id: key });
      return translated !== key ? translated : key;
    } catch {
      return key;
    }
  };

  const translatedParent = translateKey(page.parent);
  const translatedHeader = translateKey(props.header);

  return (
    <>
      <Button ref={state.anchorRef} onClick={toggleExpanded} className={props.classes.menuHeading}>
        <Box
          sx={
            translatedParent?.toLowerCase() === translatedHeader?.toLowerCase()
              ? { color: "#ff9f1c", fontWeight: 700 }
              : {}
          }
        >
          {translatedHeader}
        </Box>
        <ExpandMoreIcon />
      </Button>
    </>
  );
};

const isMenuItemActive = (entryRoute, currentPathname, allEntries) => {
  if (!entryRoute || !currentPathname) {
    return false;
  }

  if (currentPathname === entryRoute) {
    return true;
  }

  const hasMoreSpecificMatch = allEntries.some((otherEntry) => {
    const otherRoute = otherEntry.route;
    if (!otherRoute || otherRoute === entryRoute) {
      return false;
    }

    if (otherRoute.length > entryRoute.length && currentPathname.startsWith(otherRoute)) {
      const nextChar = currentPathname[otherRoute.length];
      if (nextChar === "/" || nextChar === undefined) {
        return true;
      }
    }
    return false;
  });

  if (hasMoreSpecificMatch) {
    return false;
  }

  if (currentPathname.startsWith(entryRoute) && entryRoute !== "/") {
    const nextChar = currentPathname[entryRoute.length];
    return nextChar === "/" || nextChar === undefined;
  }

  return false;
};

const MenuItemsList = ({ entries, header, classes, redirect, isAppBar = false }) => {
  const location = useLocation();
  const page = UsePageTitle();
  const currentPath = location.pathname;

  return (
    <>
      {entries.map((entry, idx) => {
        const isActive = isMenuItemActive(entry.route, currentPath, entries);

        if (isAppBar) {
          return (
            <div key={`${header}_${idx}_menuItem`}>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  redirect(entry.route);
                }}
                component="a"
                href={`${process.env.PUBLIC_URL || ""}${entry.route}`}
                passHref
                selected={isActive}
                style={{
                  backgroundColor: isActive ? "rgba(255, 159, 28, 0.1)" : "transparent",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 159, 28, 0.15)";
                    const icon = e.currentTarget.querySelector(".MuiListItemIcon-root");
                    const text = e.currentTarget.querySelector(".MuiListItemText-primary");
                    if (icon) icon.style.color = "#ff9f1c";
                    if (text) text.style.color = "#ff9f1c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    const icon = e.currentTarget.querySelector(".MuiListItemIcon-root");
                    const text = e.currentTarget.querySelector(".MuiListItemText-primary");
                    if (icon) icon.style.color = "inherit";
                    if (text) text.style.color = "inherit";
                  }
                }}
              >
                <ListItemIcon style={{ color: isActive ? "#ff9f1c" : "inherit", transition: "color 0.3s ease" }}>
                  {entry.icon}
                </ListItemIcon>
                <ListItemText
                  primary={entry.text}
                  primaryTypographyProps={{
                    style: {
                      color: isActive ? "#ff9f1c" : "inherit",
                      fontWeight: isActive ? 600 : 400,
                      transition: "color 0.3s ease",
                    },
                  }}
                />
              </MenuItem>
              {entry.withDivider && <Divider key={`${header}_${idx}_divider`} className={classes.drawerDivider} />}
            </div>
          );
        }

        return (
          <Fragment key={`${header}_${idx}`}>
            <ListItem
              button
              key={`${header}_${idx}_item`}
              onClick={(e) => {
                redirect(entry.route);
              }}
              selected={isActive}
              style={{
                backgroundColor: isActive ? "rgba(255, 159, 28, 0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #ff9f1c" : "3px solid transparent",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 159, 28, 0.15)";
                  const icon = e.currentTarget.querySelector(".MuiListItemIcon-root");
                  const text = e.currentTarget.querySelector(".MuiListItemText-primary");
                  if (icon) icon.style.color = "#ff9f1c";
                  if (text) text.style.color = "#ff9f1c";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  const icon = e.currentTarget.querySelector(".MuiListItemIcon-root");
                  const text = e.currentTarget.querySelector(".MuiListItemText-primary");
                  if (icon) icon.style.color = "inherit";
                  if (text) text.style.color = "inherit";
                }
              }}
            >
              <ListItemIcon style={{ color: isActive ? "#ff9f1c" : "inherit", transition: "color 0.3s ease" }}>
                {entry.icon}
              </ListItemIcon>
              <ListItemText
                primary={entry.text}
                primaryTypographyProps={{
                  style: {
                    color: isActive ? "#ff9f1c" : "inherit",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.3s ease",
                  },
                }}
              />
            </ListItem>
            {entry.withDivider && <Divider key={`${header}_${idx}_divider`} className={classes.drawerDivider} />}
          </Fragment>
        );
      })}
    </>
  );
};

export default withModulesManager(withTheme(withStyles(styles)(MainMenuContribution)));
