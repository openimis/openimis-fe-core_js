import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { InputAdornment } from "@material-ui/core";
import NumberInput from "./NumberInput";

class AmountInput extends Component {
  render() {
    const { intl } = this.props;

    return (
      <NumberInput
        {...this.props}
        startAdornment={<InputAdornment position="start">{intl.formatMessage({ id: "currency" })}</InputAdornment>}
      />
    );
  }
}

export default injectIntl(AmountInput);
