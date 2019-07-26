import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { withModulesManager } from "../helpers/withModulesManager";

class Contributions extends Component {
  createComponents(contributions, reverse) {
    var contribs =  contributions.map((Comp, index) => {
      let k = `${this.props.contributionKey}_${index}`;
      return <Comp {...this.props} key_index={k} key={k} />
    });
    if (reverse) {
      return contribs.reverse();
    }
    return contribs;
  }

  render() {
    const { modulesManager, contributionKey, reverse } = this.props;

    const contributions = modulesManager.getContributions(
      contributionKey
    );

    return [
          this.props.children,
          ...this.createComponents(contributions, reverse)
        ];
  }
}

Contributions.propTypes = {
  contributionKey: PropTypes.string.isRequired
};

export default withModulesManager(withRouter(Contributions));
