import React, { useState, useRef, useEffect } from "react";
import { Button, Typography, MenuList, MenuItem, Popper, Paper, Grow, ClickAwayListener } from "@mui/material";
import GetIconComponent from "../helpers/icons";
import { getLanguageNameByCode } from "../helpers/utils";
import useLanguageSwitcher from "./useLanguageSwitcher";

const Globe = GetIconComponent("Public");
const ExpandMore = GetIconComponent("ExpandMore");

// App-bar language switcher: a button showing the current language that opens a
// popper of the other languages. State/change/confirm live in useLanguageSwitcher.
const LanguageQuickPicker = () => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { languages, userLanguage, hasChoices, fetchingLanguages, choose, confirmDialog } = useLanguageSwitcher();

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) return;
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      {confirmDialog}
      {hasChoices && (
        <Button
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          color="inherit"
          onClick={() => setOpen((prev) => !prev)}
          startIcon={<Globe />}
          endIcon={<ExpandMore />}
          disabled={fetchingLanguages}
        >
          <Typography variant="button">{getLanguageNameByCode(languages, userLanguage)}</Typography>
        </Button>
      )}
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === "bottom" ? "center top" : "center bottom" }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  {languages
                    .filter(({ code }) => code !== userLanguage)
                    .map(({ name, code }) => (
                      <MenuItem
                        key={code}
                        onClick={() => {
                          setOpen(false);
                          choose(code);
                        }}
                      >
                        <Typography variant="inherit" noWrap>
                          {name}
                        </Typography>
                      </MenuItem>
                    ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default LanguageQuickPicker;
