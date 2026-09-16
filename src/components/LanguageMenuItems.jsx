import React, { createContext, useContext } from "react";
import { MenuItem, Typography, ListItemIcon } from "@mui/material";
import GetIconComponent from "../helpers/icons";

const Check = GetIconComponent("Check");

// Shares RequireAuth's useLanguageSwitcher() instance with these menu items, so the
// confirm dialog can live outside the dropdown popper — inside it the dialog makes
// invalid <ul> markup and unmounts when the popper closes.
export const LanguageSwitcherContext = createContext(null);

// Language switcher as menu items, for an app-bar dropdown ({ type: "language" }).
// State and the confirm dialog live in RequireAuth (via LanguageSwitcherContext),
// not here, so the dialog isn't trapped in the popper; onClose closes the popper
// before choosing so the dialog is unobstructed.
const LanguageMenuItems = ({ onClose }) => {
  const switcher = useContext(LanguageSwitcherContext);

  if (!switcher?.hasChoices) return null;

  const { languages, userLanguage, choose } = switcher;

  return (
    <>
      {languages.map(({ name, code }) => (
        <MenuItem
          key={code}
          selected={code === userLanguage}
          onClick={() => {
            if (code === userLanguage) return;
            onClose?.();
            choose(code);
          }}
        >
          <ListItemIcon>{code === userLanguage ? <Check fontSize="small" /> : null}</ListItemIcon>
          <Typography variant="inherit" noWrap>
            {name}
          </Typography>
        </MenuItem>
      ))}
    </>
  );
};

export default LanguageMenuItems;
