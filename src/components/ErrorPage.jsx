import React from "react";

import { Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import GetIconComponent from "../helpers/icons";
const ArrowBackIcon = GetIconComponent("ArrowBack");

import { useHistory } from "../helpers/history";

const StyledErrorPage = styled("div")(({ theme }) => ({
  "& .container": {
    textAlign: "center",
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  "& .logo": {
    verticalAlign: "middle",
    margin: theme.spacing(2),
    maxHeight: theme.spacing(16),
  },
  "& .title": {
    margin: theme.spacing(2),
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  "& .description": {
    margin: theme.spacing(2),
    fontSize: "18px",
  },
  "& .button": {
    marginTop: theme.spacing(2),
  },
}));

const ErrorPage = ({ status, title, description, logo, back }) => {
  const history = useHistory();

  return (
    <StyledErrorPage>
      <div className="container">
        {logo && <img className="logo" src={logo} alt="Logo of openIMIS" />}
        {status && (
          <Typography variant="h1" className="title">
            {status}
          </Typography>
        )}
        <Typography variant="h2" className="title">
          {title}
        </Typography>
        <Typography variant="body1" className="description">
          {description}
        </Typography>
        {back && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            className="button"
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/")}
          >
            {back}
          </Button>
        )}
      </div>
    </StyledErrorPage>
  );
};

export default ErrorPage;
