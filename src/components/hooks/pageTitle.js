import { Box, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import UsePageTitle from "./usePageTitle";

const useStyles = makeStyles((theme) => ({
  container: theme.page,
  parentTitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(0.5),
  },
  mainTitle: {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontSize: "0.9375rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginTop: theme.spacing(0.5),
  },
}));

function PageTitle() {
  const classes = useStyles();
  const page = UsePageTitle();

  if (!page.parent && !page.title) {
    return <></>;
  }

  return (
    <Grid container className={classes.container} spacing={2}>
      <Grid item xs={12}>
        <Box mt={2} mb={2}>
          {page.parent && (
            <Typography variant="body1" className={classes.parentTitle}>
              {page.parent}
            </Typography>
          )}
          {page.title && (
            <Typography variant="h4" className={classes.mainTitle}>
              {page.title}
            </Typography>
          )}
          {page.subtitle && (
            <Typography variant="body2" className={classes.subtitle}>
              {page.subtitle}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default PageTitle;
