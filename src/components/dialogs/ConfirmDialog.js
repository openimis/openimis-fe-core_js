import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { clearConfirm } from "../../actions";
import { formatMessage } from "../../helpers/i18n";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

class ConfirmDialog extends Component {
  handleCancel = () => {
    this.props.clearConfirm(false);
  };

  handleConfirm = () => {
    this.props.clearConfirm(true);
  };

  render() {
    const { intl, classes, confirm } = this.props;
    return (
      <div>
        <Dialog open={!!confirm} onClose={this.handleCancel}>
          {!!confirm && !!confirm.title && <DialogTitle>{confirm.title}</DialogTitle>}
          {!!confirm && !!confirm.message && (
            <DialogContent>
              <DialogContentText>{confirm.message}</DialogContentText>
            </DialogContent>
          )}
          <DialogActions>
            <Button onClick={this.handleConfirm} autoFocus className={classes.primaryButton}>
              {formatMessage(intl, "core", "ok")}
            </Button>
            <Button onClick={this.handleCancel} className={classes.secondaryButton}>
              {formatMessage(intl, "core", "cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      clearConfirm,
    },
    dispatch
  );
};

export default withTheme(withStyles(styles)(injectIntl(connect(null, mapDispatchToProps)(ConfirmDialog))));
