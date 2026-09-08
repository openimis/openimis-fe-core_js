import React from "react";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { formatMessage } from "../../helpers/i18n";

const StyledDialog = styled("div")(({ theme }) => ({
  "& .primaryButton": theme?.dialog?.primaryButton ?? {},
  "& .secondaryButton": theme?.dialog?.secondaryButton ?? {},
}));

const ConfirmDialog = (props) => {
  const { intl, confirm, onConfirm } = props;
  return (
    <StyledDialog>
      <Dialog open={!!confirm} onClose={() => onConfirm(false)}>
        {confirm?.title && <DialogTitle>{confirm.title}</DialogTitle>}
        {confirm?.message && (
          <DialogContent>
            <DialogContentText>{confirm.message}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => onConfirm(true)} autoFocus className="primaryButton">
            {formatMessage(intl, "core", "ok")}
          </Button>
          <Button onClick={() => onConfirm(false)} className="secondaryButton">
            {formatMessage(intl, "core", "cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
};

export { StyledDialog };
export default injectIntl(ConfirmDialog);
