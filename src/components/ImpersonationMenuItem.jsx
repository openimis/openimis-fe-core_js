import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import GetIconComponent from "../helpers/icons";
import { useAuthentication } from "../helpers/hooks";
import { useModulesManager } from "../helpers/modules";
import { useTranslations } from "../helpers/i18n";
import { stopImpersonation, setImpersonationDialogOpen } from "../actions";

const SwitchAccountIcon = GetIconComponent("SwitchAccount");
const StopIcon = GetIconComponent("Close");

// Built-in { type: "impersonation" } dropdown item, superuser-only. The dialog is
// mounted separately (ImpersonationDialog) so it survives this dropdown unmounting.
const ImpersonationMenuItem = ({ onClose }) => {
  const dispatch = useDispatch();
  const auth = useAuthentication();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core", modulesManager);
  const impersonatedUser = useSelector((state) => state.core.impersonatedUser);

  if (!auth.user?.is_superuser && !impersonatedUser) return null;

  if (impersonatedUser) {
    return (
      <MenuItem
        onClick={() => {
          dispatch(stopImpersonation());
          onClose?.();
        }}
      >
        <ListItemIcon>{StopIcon && <StopIcon fontSize="small" />}</ListItemIcon>
        <ListItemText primary={formatMessage("impersonation.stop")} secondary={impersonatedUser.username} />
      </MenuItem>
    );
  }

  return (
    <MenuItem
      onClick={() => {
        dispatch(setImpersonationDialogOpen(true));
        onClose?.();
      }}
    >
      <ListItemIcon>{SwitchAccountIcon && <SwitchAccountIcon fontSize="small" />}</ListItemIcon>
      <ListItemText primary={formatMessage("impersonation.start")} />
    </MenuItem>
  );
};

export default ImpersonationMenuItem;
