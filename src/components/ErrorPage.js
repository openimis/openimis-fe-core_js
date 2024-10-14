import React from "react";

import { Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import { useHistory } from "../helpers/history";

const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: "center",
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    verticalAlign: "middle",
    margin: theme.spacing(2),
    maxHeight: theme.spacing(16),
  },
  title: {
    margin: theme.spacing(2),
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  description: {
    margin: theme.spacing(2),
    fontSize: "18px",
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const ErrorPage = ({ status, title, description, logo, back }) => {
  const history = useHistory();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {logo && <img className={classes.logo} src={logo} alt="Logo of openIMIS" />}
      {status && (
        <Typography variant="h1" className={classes.title}>
          {status}
        </Typography>
      )}
      <Typography variant="h2" className={classes.title}>
        {title}
      </Typography>
      <Typography variant="body1" className={classes.description}>
        {description}
      </Typography>
      {back && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          className={classes.button}
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push("/")}
        >
          {back}
        </Button>
      )}
    </div>
  );
};

export default ErrorPage;
