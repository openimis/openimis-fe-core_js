import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import UserPicker from "../admin/components/pickers/UserPicker";
import { useModulesManager } from "../helpers/modules";
import { useTranslations } from "../helpers/i18n";
import { impersonateUser, setImpersonationDialogOpen } from "../actions";

// Impersonation dialog, mounted in RequireAuth (not in the ephemeral dropdown) and
// driven by core.impersonationDialogOpen so it survives the dropdown closing.
const ImpersonationDialog = () => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core", modulesManager);
  const open = useSelector((state) => state.core.impersonationDialogOpen);
  const close = () => dispatch(setImpersonationDialogOpen(false));

  return (
    <Dialog open={Boolean(open)} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{formatMessage("impersonation.dialogTitle")}</DialogTitle>
      <DialogContent sx={{ overflow: "visible" }}>
        <Box sx={{ pt: 1, minWidth: 360 }}>
          <UserPicker
            onChange={(user) => user && dispatch(impersonateUser(user))}
            withLabel={false}
            placeholder={formatMessage("impersonation.search")}
            multiple={false}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImpersonationDialog;
