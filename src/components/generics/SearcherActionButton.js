import React from "react";

import { Typography, Button } from "@material-ui/core";

import { useModulesManager } from "@openimis/fe-core";
import { DEFAULT } from "../../constants";

const SearcherActionButton = ({ onClick, startIcon, label }) => {
  const modulesManager = useModulesManager();
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

  return (
    <Button variant="outlined" style={{ border: 0 }} onClick={onClick} startIcon={startIcon}>
      {label && <Typography variant={isWorker ? "body2" : "subtitle1"}>{label}</Typography>}
    </Button>
  );
};

export default SearcherActionButton;
