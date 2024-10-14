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
  confirmMessageWithValues = null,
  translationVariables = {},
  confirmState,
  confirmTitle,
  confirmMessageComponent,
  onClose,
  onConfirm,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(module, modulesManager);
  return (
    <Dialog open={confirmState} onClose={onClose}>
      <DialogTitle>{formatMessage(confirmTitle)}</DialogTitle>
      <DialogContent>
        {confirmMessage && <DialogContentText>{formatMessage(confirmMessage)}</DialogContentText>}
        {confirmMessageWithValues && (
          <DialogContentText>{formatMessageWithValues(confirmMessageWithValues, translationVariables)}</DialogContentText>
        )}
        <DialogContentText>{confirmMessageComponent}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className={classes.secondaryButton}>
          {formatMessage(rejectionButton)}
        </Button>
        <Button onClick={onConfirm} autoFocus className={classes.primaryButton}>
          {formatMessage(confirmationButton)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(withTheme(withStyles(styles)(SelectDialog)));
