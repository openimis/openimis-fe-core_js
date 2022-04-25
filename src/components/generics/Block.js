import React from "react";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { Paper, Box, Typography } from "@material-ui/core";

const useBlockStyles = makeStyles((theme) => ({
  block: {
    ...theme.paper.paper,
    margin: 0,
  },
  header: {
    ...theme.paper.header,
    ...theme.paper.title,
  },
}));

const Block = (props) => {
  const { title, className, titleVariant = "h5", children } = props;
  const classes = useBlockStyles();
  return (
    <Paper className={clsx(classes.block, className)}>
      {title && (
        <Box className={classes.header}>
          <Typography variant={titleVariant}>{title}</Typography>
        </Box>
      )}
      <Box overflow="auto">
        <Box m="10px">{children}</Box>
      </Box>
    </Paper>
  );
};

export default Block;
