import React from "react";
import { Box, Typography } from "@mui/material";

// Content of one tab in a tabbed form. Published as core.TabPanel so modules do
// not depend on the module that happens to ship it (policyHolder.TabPanel is
// kept by fe-policyholder as an alias).
const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && (
      <Box p={3}>
        <Typography component="span">{children}</Typography>
      </Box>
    )}
  </div>
);

export default TabPanel;
