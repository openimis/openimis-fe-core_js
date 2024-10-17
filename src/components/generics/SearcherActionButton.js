import React from "react";

import { Typography, Button } from "@material-ui/core";

const SearcherActionButton = ({ onClick, startIcon, label }) => {
  return (
    <Button variant="outlined" style={{ border: 0 }} onClick={onClick} startIcon={startIcon}>
      {label && <Typography variant="body2">{label}</Typography>}
    </Button>
  );
};

export default SearcherActionButton;
