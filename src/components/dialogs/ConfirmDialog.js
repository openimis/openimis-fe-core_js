import React from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const ConfirmDialog = props => {
  const { intl, classes, confirm, onConfirm, submitting } = props;
  return (
    <div>
      <Dialog open={!!confirm} onClose={submitting ? undefined : () => onConfirm(false)}>
        {confirm?.title && <DialogTitle>{confirm.title}</DialogTitle>}
        {confirm?.message && (
          <DialogContent>
            <DialogContentText>{confirm.message}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => onConfirm(true)} autoFocus className={classes.primaryButton} disabled={submitting}>
            {formatMessage(intl, "core", "ok")}
          </Button>
          <Button onClick={() => onConfirm(false)} className={classes.secondaryButton} disabled={submitting}>
            {formatMessage(intl, "core", "cancel")}
          </Button>
          {!!submitting && <CircularProgress size={20} />}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withTheme(withStyles(styles)(injectIntl(ConfirmDialog)));
