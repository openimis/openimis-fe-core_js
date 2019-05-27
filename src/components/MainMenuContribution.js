import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Divider, List, IconButton } from "@material-ui/core";

const styles = theme => ({
  panel: {
    margin: "0px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(20),
    color: theme.palette.text.primary,
    paddingTop: "10px"
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  }
});

class MainMenuContribution extends Component {
  state = {
    expanded: false
  };

  toggleExpanded = event => {
    this.setState({ expanded: !this.state.expanded });
  };

  redirect(route) {
    this.props.history.push(`${process.env.PUBLIC_URL || ""}${route}`);
  }

  render() {
    const { classes, header, icon, entries } = this.props;

    return (
      <Fragment>
        <ExpansionPanel
          className={classes.panel}
          expanded={this.state.expanded}
          onChange={this.toggleExpanded}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${header}-content`}
            id={`${header}-header`}
          >
            <IconButton>{icon}</IconButton>
            <Typography className={classes.heading}>{header}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <List component="nav">
              {entries.map(entry => (
                <Fragment>
                  <ListItem
                    button
                    key={`${header}_${entry.text}`}
                    onClick={e => {
                      this.redirect(entry.route);
                    }}
                  >
                    <ListItemIcon>{entry.icon}</ListItemIcon>
                    <ListItemText primary={entry.text} />
                  </ListItem>
                  {entry.withDivider && <Divider />}
                </Fragment>
              ))}
            </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Fragment>
    );
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(MainMenuContribution);
