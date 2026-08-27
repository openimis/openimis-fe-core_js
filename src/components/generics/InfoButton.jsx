import React, { useState, useCallback } from "react";
import clsx from "clsx";

import { styled } from "@mui/material/styles";
import { IconButton, Popover, Typography, Tooltip } from "@mui/material";
import GetIconComponent from "../../helpers/icons";

const InfoIcon = GetIconComponent("Info");
import { useTranslations } from "../../helpers/i18n";
import { MODULE_NAME } from "../../constants";

const StyledInfoButton = styled("div")(({ theme }) => ({
  "& .popoverContent": {
    padding: theme.spacing(1),
  },
  "& .iconSmall": {
    fontSize: 16,
  },
  "& .iconMedium": {
    fontSize: 24,
  },
  "& .iconLarge": {
    fontSize: 32,
  },
  "& .maxWidthSmall": {
    maxWidth: 300,
  },
  "& .maxWidthMedium": {
    maxWidth: 450,
  },
  "& .maxWidthLarge": {
    maxWidth: 600,
  },
}));

export default function InfoButton({
  iconSize = "medium",
  iconColor = "primary",
  iconButtonSize = "medium",
  maxWidth = "medium",
  content = "",
  anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin = {
    vertical: "top",
    horizontal: "right",
  },
}) {
  const { formatMessage } = useTranslations(MODULE_NAME);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "info-popover" : undefined;

  return (
    <StyledInfoButton>
      <Tooltip title={formatMessage("InfoButton.tooltip")}>
        <IconButton size={iconButtonSize} onClick={handleClick} aria-describedby={id}>
          <InfoIcon
            color={iconColor}
            className={clsx({
              "iconSmall": iconSize === "small",
              "iconMedium": iconSize === "medium",
              "iconLarge": iconSize === "large",
            })}
          />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <Typography
          variant="body2"
          className={clsx({
            "popoverContent": true,
            "maxWidthSmall": maxWidth === "small",
            "maxWidthMedium": maxWidth === "medium",
            "maxWidthLarge": maxWidth === "large",
          })}
        >
          {content}
        </Typography>
      </Popover>
    </StyledInfoButton>
  );
}
