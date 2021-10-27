import React, { Component } from "react";
import PropTypes from "prop-types";

function withHistory(C) {
  return class ManagedComponent extends Component {
    static contextTypes = {
      history: PropTypes.object.isRequired,
    };
    render() {
      const { history } = this.context;
      return <C {...this.props} history={history} />;
    }
  };
}

export default withHistory;

export function _historyPush(mm, history, route, newTab) {
  if (!!newTab && mm.getConf("fe-core", "useDynPermalinks", false)) {
    let r = btoa(`${process.env.PUBLIC_URL || ""}${route}`);
    window.open(`${process.env.PUBLIC_URL || ""}?dyn=${r}`);
  } else if (!!newTab) {
    window.open(`${process.env.PUBLIC_URL || ""}${route}`);
  } else {
    history.push(`${process.env.PUBLIC_URL || ""}${route}`);
  }
}

export function historyPush(mm, history, route, params, newTab = false) {
  _historyPush(mm, history, `/${mm.getRef(route)}${!!params ? "/" + params.join("/") : ""}`, newTab);
}
