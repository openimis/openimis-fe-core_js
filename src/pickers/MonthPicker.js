import React, { Component } from "react";
import _ from "lodash";
import ConstantBasedPicker from "./ConstantBasedPicker";

class MonthPicker extends Component {

    render() {
        const { module = "core", label = "month", ...others } = this.props;
        return <ConstantBasedPicker
            module={module}
            label={label}
            constants={_.range(1, 12)}
            {...others}
        />
    }
}

export default MonthPicker;