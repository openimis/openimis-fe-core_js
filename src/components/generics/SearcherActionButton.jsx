import React from "react";
import { Button, IconButton } from "@mui/material";

import { useModulesManager } from "../../helpers/modules";
import { DEFAULT } from "../../constants";

const SearcherActionButton = ({ onClick, startIcon, label, isLocationPane }) => {
  const modulesManager = useModulesManager();
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

  if (isLocationPane) {
    return (
      <IconButton
        size="small"
        onClick={onClick}
        color="inherit"
        sx={{
          padding: "4px",
        }}
      >
        {startIcon}
      </IconButton>
    );
  }

  return (
    <Button 
      variant="text" 
      onClick={onClick} 
      startIcon={startIcon} 
      color="inherit"
      size={isWorker ? "small" : "medium"}
    >
      {label}
    </Button>
  );
};

export default SearcherActionButton;
