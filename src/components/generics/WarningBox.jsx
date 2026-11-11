import React from "react";
import PropTypes from "prop-types";

import { Grid, Box, Typography } from "@mui/material";

const DEFAULT_STYLES = {
  backgroundColor: "khaki",
  padding: "12px",
  margin: "4px",
  borderLeft: "5px solid #ffa000",
  borderRadius: "10px",
};

// React 19 ignores defaultProps on function components: defaults live in the parameters.
const WarningBox = ({ title, description, styles = {}, xs = 12 }) => {
  return (
    <Grid size={xs || 12}>
      <Box
        style={{
          ...DEFAULT_STYLES,
          ...styles,
        }}
      >
        <Typography variant="subtitle1">
          <strong>{title}:</strong> {description}
        </Typography>
      </Box>
    </Grid>
  );
};

WarningBox.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  styles: PropTypes.object,
  xs: PropTypes.number,
};

export default WarningBox;
