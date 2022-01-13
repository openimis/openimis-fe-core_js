import React from "react";
import { useLocation, useHistory, useParams, useRouteMatch } from "react-router";
import { Link, NavLink, Redirect } from "react-router-dom";

export { Link, NavLink, Redirect };
export { useLocation, useHistory, useParams, useRouteMatch };

export default function withHistory(C) {
  console.warn("[Deprecated]: Prefer using directly the `useHistory` hook to get the history");
  return (props) => {
    const history = useHistory();
    return <C {...props} history={history} />;
  };
}

export function _historyPush(mm, history, route, asNewTab) {
  if (asNewTab) {
    const hasDynLink = mm.getConf("fe-core", "useDynPermalinks", false);
    const link = history.createHref({ pathname: route });
    window.open(hasDynLink ? `/?dyn=${btoa(link)}` : link);
  } else {
    history.push(route);
  }
}

export function historyPush(mm, history, route, params, newTab = false) {
  _historyPush(mm, history, `/${mm.getRef(route)}${!!params ? "/" + params.join("/") : ""}`, newTab);
}
