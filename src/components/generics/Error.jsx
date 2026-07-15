import React, { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Divider } from "@mui/material";

const StyledError = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  "& .errorHeader": {
    color: theme.palette.error.main,
  },
  "& .errorDetail": {
    color: theme.palette.error.main,
  },
}));

function Error(props) {
  const { error } = props;
  return (
    <StyledError>
      <Typography variant="h6" className="errorHeader">
        {error.code} {error.code && ": "} {error.message}
      </Typography>
      {!!error.detail && (
        <Fragment>
          <Divider />
          <Typography variant="body1" className="errorDetail">
            {error.detail}
          </Typography>
        </Fragment>
      )}
    </StyledError>
  );
}

export default Error;
