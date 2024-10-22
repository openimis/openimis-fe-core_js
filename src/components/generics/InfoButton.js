import React, { useState, useCallback } from "react";
import clsx from "clsx";

import { makeStyles } from "@material-ui/styles";
import { IconButton, Popover, Typography, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useTranslations } from "../../helpers/i18n";
import { MODULE_NAME } from "../../constants";

const useStyles = makeStyles((theme) => ({
  popoverContent: {
    padding: theme.spacing(1),
  },
  iconSmall: {
    fontSize: 16,
  },
  iconMedium: {
    fontSize: 24,
  },
  iconLarge: {
    fontSize: 32,
  },
  maxWidthSmall: {
    maxWidth: 300,
  },
  maxWidthMedium: {
    maxWidth: 450,
  },
  maxWidthLarge: {
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
  const classes = useStyles();
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
    <>
      <Tooltip title={formatMessage("InfoButton.tooltip")}>
        <IconButton size={iconButtonSize} onClick={handleClick} aria-describedby={id}>
          <InfoIcon
            color={iconColor}
            className={clsx({
              [classes.iconSmall]: iconSize === "small",
              [classes.iconMedium]: iconSize === "medium",
              [classes.iconLarge]: iconSize === "large",
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
            [classes.popoverContent]: true,
            [classes.maxWidthSmall]: maxWidth === "small",
            [classes.maxWidthMedium]: maxWidth === "medium",
            [classes.maxWidthLarge]: maxWidth === "large",
          })}
        >
          {content}
        </Typography>
      </Popover>
    </>
  );
}
