import React, { Component } from "react";
import PropTypes from "prop-types";
import groupBy from "lodash/groupBy";

const RENDER_APPEND = "append";
const RENDER_PREPEND = "prepend";

class ContributedComponent extends Component {
  getComponent(Comp) {
    if (!Comp) return null;
    return (
      <Comp {...this.props} key={`contrib-${this.props.contributionKey}`} />
    );
  }

  createComponents(contributions) {
    return contributions.map(contrib => {
      const Comp = contrib.component;
      return this.getComponent(Comp);
    });
  }

  render() {
    const { modulesManager, contributionKey } = this.props;

    const contributions = modulesManager.getContributions(contributionKey);
    const contributionsByRenderType = groupBy(contributions, "renderType");

    const prependComponents = contributionsByRenderType[RENDER_PREPEND] || [];
    const appendComponents = contributionsByRenderType[RENDER_APPEND] || [];

    return (
      <div>
        {[
          ...this.createComponents(prependComponents),
          this.props.children,
          ...this.createComponents(appendComponents),
        ]}
      </div>
    );
  }
}

ContributedComponent.propTypes = {
  modulesManager: PropTypes.object.isRequired,
  contributionKey: PropTypes.string.isRequired
}


export default ContributedComponent;
