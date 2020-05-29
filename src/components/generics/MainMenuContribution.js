import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Divider, List, IconButton, MenuList, MenuItem, Button, Popper, Grow, Paper, ClickAwayListener } from "@material-ui/core";
import withModulesManager from "../../helpers/modules";
import { _historyPush } from '../../helpers/history';

const styles = theme => ({
  panel: {
    margin: "0 !important",
    padding: 0,
  },
  drawerHeading: {
    fontSize: theme.menu.drawer.fontSize,
    color: theme.palette.text.primary,
    paddingTop: theme.menu.drawer.fontSize / 2
  },
  drawerDivider: {
    // width: 100
  },
  menuHeading: {
    fontSize: theme.menu.appBar.fontSize,
    color: theme.palette.text.second,
    paddingTop: theme.menu.appBar.fontSize / 2,
    textTransform: "none"
  },
  appBarMenuPaper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  popper: {
    zIndex: 1200
  }
});

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    display: "block"
  },
}))(MuiExpansionPanelDetails);

class MainMenuContribution extends Component {
  state = {
    expanded: false,
    anchorRef: React.createRef(),
  };

  toggleExpanded = event => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleMenuClose = event => {
    if (this.state.anchorRef.current && this.state.anchorRef.current.contains(event.target)) {
      return;
    }
    this.toggleExpanded(event);
  }

  handleMenuSelect = (e, route) => {
    e.stopPropagation();
    e.preventDefault();
    this.redirect(route);
  }

  redirect(route) {
    const { modulesManager, history } = this.props;
    _historyPush(modulesManager, history, route);
  }

  appBarMenu = () => {
    return (
      <Fragment>
        <Button
          ref={this.state.anchorRef}
          onClick={this.toggleExpanded}
          className={this.props.classes.menuHeading}
        >
          {this.props.header}
          <ExpandMoreIcon />
        </Button>
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
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom"
              }}
            >
              <Paper
                className={this.props.classes.appBarMenuPaper}
                id={`${this.props.header}-menu-list`}
              >
                <ClickAwayListener onClickAway={this.handleMenuClose}>
                  <MenuList>
                    {this.props.entries.map((entry, idx) => (
                      <div key={`${this.props.header}_${idx}_menuItem`}>
                        <MenuItem onClick={e => this.handleMenuSelect(e, entry.route)}>
                          <ListItemIcon>{entry.icon}</ListItemIcon>
                          <ListItemText primary={entry.text} />
                        </MenuItem>
                        {entry.withDivider && (
                          <Divider
                            key={`${this.props.header}_${idx}_divider`}
                            className={this.props.classes.drawerDivider}
                          />
                        )}
                      </div>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Fragment>
    );
  }

  drawerMenu = () => {
    return (
      <ExpansionPanel
        className={this.props.classes.panel}
        expanded={this.state.expanded}
        onChange={this.toggleExpanded}
      >
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          id={`${this.props.header}-header`}
        >
          <IconButton>{this.props.icon}</IconButton>
          <Typography className={this.props.classes.drawerHeading}>{this.props.header}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List component="nav">
            {this.props.entries.map((entry, idx) => (
              <Fragment key={`${this.props.header}_${idx}`}>
                <ListItem
                  button
                  key={`${this.props.header}_${idx}_item`}
                  onClick={e => {
                    this.redirect(entry.route);
                  }}
                >
                  <ListItemIcon>{entry.icon}</ListItemIcon>
                  <ListItemText primary={entry.text} />
                </ListItem>
                {entry.withDivider && (
                  <Divider
                    key={`${this.props.header}_${idx}_divider`}
                    className={this.props.classes.drawerDivider} />
                )}
              </Fragment>
            ))}
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  render() {
    const { menuVariant } = this.props;
    if (menuVariant === 'AppBar') {
      return this.appBarMenu();
    } else {
      return this.drawerMenu();
    }
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
};

export default withModulesManager(withTheme(withStyles(styles)(MainMenuContribution)));
