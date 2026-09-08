import React from "react";
import { injectIntl } from "react-intl";

import { styled } from "@mui/material/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useModulesManager } from "../../helpers/modules";
import { useTranslations } from "../../helpers/i18n";

const StyledDialog = styled("div")(({ theme }) => ({
  "& .primaryButton": theme?.dialog?.primaryButton ?? {},
  "& .secondaryButton": theme?.dialog?.secondaryButton ?? {},
}));

const SelectDialog = ({
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
    <StyledDialog>
      <Dialog open={confirmState} onClose={onClose}>
        <DialogTitle>{formatMessage(confirmTitle)}</DialogTitle>
        <DialogContent>
          {confirmMessage && <DialogContentText>{formatMessage(confirmMessage)}</DialogContentText>}
          {confirmMessageWithValues && (
            <DialogContentText>
              {formatMessageWithValues(confirmMessageWithValues, translationVariables)}
            </DialogContentText>
          )}
          <DialogContentText>{confirmMessageComponent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} className="secondaryButton">
            {formatMessage(rejectionButton)}
          </Button>
          <Button onClick={onConfirm} autoFocus className="primaryButton">
            {formatMessage(confirmationButton)}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
};

export { StyledDialog };
export default injectIntl(SelectDialog);
