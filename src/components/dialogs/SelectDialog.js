import React from "react";
import { injectIntl } from "react-intl";

import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { useTranslations, useModulesManager } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const SelectDialog = ({
  classes,
  module,
  confirmationButton,
  rejectionButton,
  confirmMessage,
  confirmState,
  confirmTitle,
  onClose,
  onConfirm,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(module, modulesManager);
  return (
    <Dialog open={confirmState} onClose={onClose}>
      <DialogTitle>{formatMessage(confirmTitle)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{formatMessage(confirmMessage)}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} autoFocus className={classes.primaryButton}>
          {formatMessage(confirmationButton)}
        </Button>
        <Button onClick={onClose} className={classes.secondaryButton}>
          {formatMessage(rejectionButton)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(withTheme(withStyles(styles)(SelectDialog)));
