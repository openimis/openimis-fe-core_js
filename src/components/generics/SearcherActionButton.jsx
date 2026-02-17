import React from "react";
import { Button, IconButton } from "@mui/material";

import { useModulesManager } from "../../helpers/modules";
import { DEFAULT } from "../../constants";

const SearcherActionButton = ({ onClick, startIcon, dataCy, label }) => {
  const modulesManager = useModulesManager();
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

  return (
    <Button 
      variant="text" 
      onClick={onClick} 
      startIcon={startIcon} 
      color="inherit"
      size={isWorker ? "small" : "medium"}
      data-cy={dataCy}
    >
      {label}
    </Button>
  );
};

export default SearcherActionButton;
