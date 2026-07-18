import React from "react";

import { IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import GetIconComponent from "../helpers/icons";

import { MODULE_NAME } from "../constants";
import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { useTranslations } from "../helpers/i18n";

const ExitToApp = GetIconComponent("ExitToApp");

const StyledLogoutButton = styled("div")(({ theme }) => ({
  "& .button": {
    color: theme.palette.secondary.main,
  },
}));

const LogoutButton = () => {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <StyledLogoutButton>
      <Tooltip title={formatMessage("core.tooltip.logout")}>
        <IconButton className="button" onClick={() => history.push("/logout")}>
          <ExitToApp />
        </IconButton>
      </Tooltip>
    </StyledLogoutButton>
  );
};

export default LogoutButton;
