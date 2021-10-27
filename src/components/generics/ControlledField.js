import { Component } from "react";
import withModulesManager from "../../helpers/modules";

class ControlledField extends Component {
  render() {
    const { modulesManager, module, id, field } = this.props;
    if (modulesManager.hideField(module, id)) {
      return null;
    }
    return field;
  }
}

export default withModulesManager(ControlledField);
