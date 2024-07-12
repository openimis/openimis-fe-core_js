import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Typography, MenuList, MenuItem, Popper, Paper, Grow, ClickAwayListener } from "@material-ui/core";
import { Public as Globe, ExpandMore } from "@material-ui/icons";

import { SelectDialog } from "@openimis/fe-core";
import { changeUserLanguage, fetchLanguages } from "../actions";
import { getLanguageNameByCode } from "../helpers/utils";

const LanguageQuickPicker = () => {
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState(null);

  const {
    user,
    languages: availableLanguages,
    fetchingLanguages,
    fetchedLanguages,
  } = useSelector((state) => state.core);
  const userLanguage = user.i_user.language;

  useEffect(() => {
    if (!fetchingLanguages && !fetchedLanguages) {
      dispatch(fetchLanguages());
    }
  }, [dispatch, fetchingLanguages, fetchedLanguages]);

  const memoizedAvailableLanguages = useMemo(() => availableLanguages, [availableLanguages]);

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMenuItemClick = (lang) => {
    setOpen(false);
    setShowConfirmDialog(true);
    setChosenLanguage(lang);
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
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const onDialogConfirm = () => {
    try {
      dispatch(changeUserLanguage(chosenLanguage, "Change User Language"));
      window.location.reload();
    } catch (error) {
      throw new Error(`[LANGUAGE_QUICK_PICKER]: Error occurred. ${error}`);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const onDialogClose = () => setShowConfirmDialog(false);

  const renderMenuItems = () =>
    memoizedAvailableLanguages
      .filter(({ code }) => code !== userLanguage)
      .map(({ name, code }) => (
        <MenuItem key={code} onClick={() => handleMenuItemClick(code)}>
          <Typography variant="inherit" noWrap>
            {name}
          </Typography>
        </MenuItem>
      ));

  return (
    <>
      <SelectDialog
        confirmState={showConfirmDialog}
        onConfirm={onDialogConfirm}
        onClose={onDialogClose}
        module="core"
        confirmTitle="core.LanguageQuickPicker.dialog.title"
        confirmMessageWithValues="core.LanguageQuickPicker.dialog.message"
        translationVariables={{ language: getLanguageNameByCode(memoizedAvailableLanguages, chosenLanguage) }}
        confirmationButton="core.LanguageQuickPicker.dialog.confirm"
        rejectionButton="core.LanguageQuickPicker.dialog.cancel"
      />
      {availableLanguages && availableLanguages.length !== 0 && availableLanguages.length !== 1 && (
        <Button
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          color="inherit"
          onClick={handleToggle}
          startIcon={<Globe />}
          endIcon={<ExpandMore />}
          disabled={!availableLanguages.length || fetchingLanguages}
        >
          <Typography variant="button">{getLanguageNameByCode(memoizedAvailableLanguages, userLanguage)}</Typography>
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
                  {renderMenuItems()}
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
