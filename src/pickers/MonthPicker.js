import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import ConstantBasedPicker from "../components/generics/ConstantBasedPicker";

class MonthPicker extends Component {
  render() {
    const { intl, module = "core", label = "month", withNull, ...others } = this.props;
    return <ConstantBasedPicker module={module} label={label} withNull={withNull} constants={_.range(1, 13)} {...others} />;
  }
}

export default injectIntl(MonthPicker);
