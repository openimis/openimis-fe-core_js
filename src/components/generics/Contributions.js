import React, { Component } from "react";
import PropTypes from "prop-types";
import withModulesManager from "../../helpers/modules";
import _ from "lodash";

class Contributions extends Component {
  createComponents(contributions, reverse) {
    const { modulesManager } = this.props;
    var contribs = contributions.map((Comp, index) => {
      let k = `${this.props.contributionKey}_${index}`;
      let keys= {
        "key_index":k,
        "key":k
      }      
      if (_.isString(Comp)) {
        var C = modulesManager.getRef(Comp);
        return <C {...this.props} {...keys} />
      } else {
        return <Comp {...this.props} {...keys} />
      }
    });
    if (reverse) {
      return contribs.reverse();
    }
    return contribs;
  }

  render() {
    const { modulesManager, contributionKey, reverse } = this.props;

    const contributions = modulesManager.getContribs(
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

export default withModulesManager(Contributions);
