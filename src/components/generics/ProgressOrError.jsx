import React, { Component, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import Error from "./Error";

const StyledProgressOrError = styled("div")(({ theme }) => ({
  "& .progress": {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    align: "center",
  },
}));

class ProgressOrError extends Component {
  render() {
    const { progress, error, size } = this.props;
    return (
      <StyledProgressOrError>
        {!!progress && <CircularProgress size={size} className="progress" />}
        {!progress && !!error && <Error error={error} />}
      </StyledProgressOrError>
    );
  }
}

export default ProgressOrError;
