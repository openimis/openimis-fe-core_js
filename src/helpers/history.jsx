import React from "react";
import { useLocation, useHistory, useParams, useRouteMatch } from "react-router";
import { Link, NavLink, Redirect } from "react-router-dom";

export { Link, NavLink, Redirect };
export { useLocation, useHistory, useParams, useRouteMatch };

export { withHistory };
export default function withHistory(C) {
  return (props) => {
    const history = useHistory();
    return <C {...props} history={history} />;
  };
}

export function _historyPush(mm, history, pathname, asNewTab, search = "") {
  const location = { pathname, search: search || "" };
  if (asNewTab) {
    const hasDynLink = mm.getConf("fe-core", "useDynPermalinks", false);
    const link = history.createHref(location);
    window.open(hasDynLink ? `/?dyn=${btoa(link)}` : link);
  } else {
    history.push(location);
  }
}

export function historyPush(mm, history, route, params, newTab = false, search = "") {
  const pathname = `/${mm.getRef(route)}${params?.length ? "/" + params.join("/") : ""}`;
  _historyPush(mm, history, pathname, newTab, search);
}
