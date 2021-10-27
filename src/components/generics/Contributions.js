import React, { Component } from "react";
import PropTypes from "prop-types";
import withModulesManager from "../../helpers/modules";
import _ from "lodash";

class Contributions extends Component {
  createComponents(contributions, reverse) {
    const { classes, modulesManager, contributionKey, ...others } = this.props;
    const contribs = contributions.map((ElementTag, index) => {
      let k = `${contributionKey}_${index}`;
      let keys = {
        "key_index": k,
        "key": k,
      };
      if (_.isString(ElementTag)) {
        const ContributionComponent = modulesManager.getRef(ElementTag);
        return <ContributionComponent {...others} {...keys} />;
      } else {
        return <ElementTag {...others} {...keys} />;
      }
    });
    if (reverse) {
      return contribs.reverse();
    }
    return contribs;
  }

  render() {
    const { modulesManager, contributionKey, reverse } = this.props;

    const contributions = modulesManager.getContribs(contributionKey);

    return [this.props.children, ...this.createComponents(contributions, reverse)];
  }
}

Contributions.propTypes = {
  contributionKey: PropTypes.string.isRequired,
};

export default withModulesManager(Contributions);
