import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import FormattedMessage from "./FormattedMessage";

const StyledTypography = styled(Typography)(({ theme }) => ({
  ...(theme.typography?.label ?? {}),
}));

class FieldLabel extends Component {
  render() {
    const { module, id } = this.props;
    return (
      <StyledTypography variant="caption">
        <FormattedMessage module={module} id={id} />
      </StyledTypography>
    );
  }
}

export { StyledTypography };
export default injectIntl(FieldLabel);
