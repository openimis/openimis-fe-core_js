import React from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const ConfirmDialog = props => {
  const { intl, classes, confirm, onConfirm} = props;
  return (
    <div>
      <Dialog open={!!confirm} onClose={() => onConfirm(false)}>
        {confirm?.title && <DialogTitle>{confirm.title}</DialogTitle>}
        {confirm?.message && (
          <DialogContent>
            <DialogContentText>{confirm.message}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => onConfirm(true)} autoFocus className={classes.primaryButton}>
            {formatMessage(intl, "core", "ok")}
          </Button>
          <Button onClick={() => onConfirm(false)} className={classes.secondaryButton}>
            {formatMessage(intl, "core", "cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withTheme(withStyles(styles)(injectIntl(ConfirmDialog)));
