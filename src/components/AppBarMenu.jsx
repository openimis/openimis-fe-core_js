import React, { useState, useRef } from "react";
import {
  IconButton,
  Tooltip,
  Popper,
  Paper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "../helpers/history";
import LanguageMenuItems from "./LanguageMenuItems";
import ImpersonationMenuItem from "./ImpersonationMenuItem";

// GetIconComponent returns a component function; entries may also carry a ready element.
const renderIcon = (icon) => (typeof icon === "function" ? React.createElement(icon) : icon || null);

// App-bar dropdown rendered for a core.AppBarIcons entry that has nested `entries`.
// Each sub-item is prepared (see prepareAppBarIcons) into one of:
//   { type: "link", route, text, icon }  – navigates
//   { type: "divider" }
//   { type: "label", text }              – non-clickable section heading
//   { type: "language" }                 – built-in language switcher (LanguageMenuItems)
//   { type: "impersonation" }            – built-in superuser impersonation entry
const AppBarMenu = ({ icon, text, entries = [] }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const close = () => setOpen(false);

  return (
    <>
      <Tooltip title={text || ""}>
        <IconButton
          ref={anchorRef}
          color="inherit"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {renderIcon(icon)}
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement="bottom-end"
        style={{ zIndex: 1400 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "top right" }}>
            <Paper elevation={4}>
              <ClickAwayListener onClickAway={close}>
                <MenuList autoFocusItem={open}>
                  {entries.map((item, idx) => {
                    if (item.type === "divider") {
                      return <Divider key={`div_${idx}`} component="li" />;
                    }
                    if (item.type === "label") {
                      return (
                        <Typography
                          key={`lbl_${idx}`}
                          variant="caption"
                          sx={{ px: 2, py: 0.5, display: "block", opacity: 0.7 }}
                        >
                          {item.text}
                        </Typography>
                      );
                    }
                    if (item.type === "language") {
                      return <LanguageMenuItems key={`lang_${idx}`} />;
                    }
                    if (item.type === "impersonation") {
                      return <ImpersonationMenuItem key={`imp_${idx}`} onClose={close} />;
                    }
                    // default: a navigating link
                    return (
                      <MenuItem key={`lnk_${idx}`} component={Link} to={item.route} onClick={close}>
                        {item.icon && <ListItemIcon>{renderIcon(item.icon)}</ListItemIcon>}
                        <ListItemText primary={item.text} />
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default AppBarMenu;
