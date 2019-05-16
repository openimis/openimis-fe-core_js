import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Divider } from "@material-ui/core";

class MainMenuContribution extends Component {
  render() {
    const { header, entries, history } = this.props;
    return (
      <Fragment>
        <ListItem>
          <Typography variant="h6">{header}</Typography>
        </ListItem>
        {entries.map(entry => (
          <ListItem
            button
            key={entry.text}
            onClick={e => {
              history.push(entry.route);
            }}
          >
            <ListItemIcon>{entry.icon}</ListItemIcon>
            <ListItemText primary={entry.text} />
          </ListItem>
        ))}
        <Divider />
      </Fragment>
    );
  }
}

MainMenuContribution.propTypes = {
  header: PropTypes.string.isRequired,
  entries: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default MainMenuContribution;
