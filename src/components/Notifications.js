import React, { Component } from "react";
import { connect } from "react-redux";
import Alert from "./Alert";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 2,
  },
});

class Notification extends Component {
  buildAlert(message) {
    return <Alert> {message} </Alert>;
  }

  render() {
    let notification = null;
    if (this.props.category === "alert") {
      notification = this.buildAlert(this.props.message);
    }
    return notification;
  }
}

function Notifications(props) {
  return (
    <div className={props.classes.root}>
      {props.notifications.map((notification, index) => (
        <Notification
          key={index}
          category={notification.category}
          message={notification.message}
        />
      ))}
    </div>
  );
}

const mapStateToProps = (state, props) => ({
  notifications: state.notifications[props.category] || [],
});

export default connect(mapStateToProps)(withStyles(styles)(Notifications));
