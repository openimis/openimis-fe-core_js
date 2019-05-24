import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

class Contributions extends Component {
  createComponents(contributions) {
    return contributions.map((Comp, index) => {
      let k = `${this.props.contributionKey}_${index}`;
      return <Comp {...this.props} key_index={k} key={k} />
    });
  }

  render() {
    const { modulesManager, contributionKey } = this.props;

    const contributions = modulesManager.getContributions(
      contributionKey
    );

    return [
          this.props.children,
          ...this.createComponents(contributions, history)
        ];
  }
}

Contributions.propTypes = {
  modulesManager: PropTypes.object.isRequired,
  contributionKey: PropTypes.string.isRequired
};

export default withRouter(Contributions);
// export default Contributions;
