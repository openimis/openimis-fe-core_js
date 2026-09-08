import React from "react";
import { useHistory } from "../helpers/history";
import { injectIntl } from "react-intl";
import { IconButton, Tooltip } from "@mui/material";
import GetIconComponent from "../helpers/icons";
import { formatMessage } from "@openimis/fe-core";

const AppBarIconButton = ({ intl, icon, route, text }) => {
  const history = useHistory();
  const Icon = GetIconComponent(icon);

  const handleClick = () => {
    history.push(route);
  };

  return (
    <Tooltip title={text}>
      <IconButton color="inherit" onClick={handleClick}>
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(AppBarIconButton);
