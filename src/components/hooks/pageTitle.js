import { Box, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const user = useSelector((state) => state.core.user);

  if (!page.parent && !page.title) {
    return <></>;
  }

  const isHomePage = location.pathname === "/home" || location.pathname === "/front/home";
  const username = user?.i_user?.username || user?.username || "";

  let displaySubtitle = page.subtitle;
  if (isHomePage && username) {
    displaySubtitle = `Bienvenue sur le compte ${username} !`;
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
          {displaySubtitle && (
            <Typography variant="body2" className={classes.subtitle}>
              {displaySubtitle}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default PageTitle;
