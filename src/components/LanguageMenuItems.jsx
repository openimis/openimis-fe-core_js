import React from "react";
import { MenuItem, Typography, ListItemIcon } from "@mui/material";
import GetIconComponent from "../helpers/icons";
import useLanguageSwitcher from "../pickers/useLanguageSwitcher";

const Check = GetIconComponent("Check");

// Menu-item variant of the language switcher, for embedding in an app-bar dropdown
// (core.AppBarIcons entry with { type: "language" }). Rendering only — the state,
// change action and confirm/reload flow come from useLanguageSwitcher.
const LanguageMenuItems = () => {
  const { languages, userLanguage, hasChoices, choose, confirmDialog } = useLanguageSwitcher();

  if (!hasChoices) return null;

  return (
    <>
      {languages.map(({ name, code }) => (
        <MenuItem key={code} selected={code === userLanguage} onClick={() => code !== userLanguage && choose(code)}>
          <ListItemIcon>{code === userLanguage ? <Check fontSize="small" /> : null}</ListItemIcon>
          <Typography variant="inherit" noWrap>
            {name}
          </Typography>
        </MenuItem>
      ))}
      {confirmDialog}
    </>
  );
};

export default LanguageMenuItems;
