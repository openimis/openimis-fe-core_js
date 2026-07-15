import React from "react";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { Paper, Box, Typography } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper,
  margin: 0,
  "& .header": {
    ...theme.paper?.header,
    ...theme.paper?.title,
  },
}));

const Block = (props) => {
  const { title, className, titleVariant = "h5", children } = props;
  return (
    <StyledPaper className={className}>
      {title && (
        <Box className="header">
          <Typography variant={titleVariant}>{title}</Typography>
        </Box>
      )}
      <Box overflow="auto">
        <Box m="10px">{children}</Box>
      </Box>
    </StyledPaper>
  );
};

export default Block;
