/*
 * react-router 5 API on top of react-router 7.
 *
 * openIMIS modules were written against react-router 5: route components receive
 * `history`, `location` and `match` props, class components get `history` from
 * `withHistory`, and navigation goes through `history.push / replace / goBack`.
 * fe-core is the only module that imports react-router; this file keeps that
 * contract so the modules do not change with the router.
 */
import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import {
  Link,
  NavLink,
  Navigate,
  UNSAFE_NavigationContext,
  createPath,
  matchPath,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

export { Link, NavLink, useLocation, useParams };

// Callbacks registered through history.block(), consulted by <HistoryBlocker />.
const blockers = new Set();

// react-router 5 (history 4) resolved a relative path against the current one, the
// way a link in the page is resolved; react-router 7 resolves it against the route.
function resolveRelative(path, currentPathname) {
  if (!path || path.startsWith("/") || path.startsWith("?") || path.startsWith("#")) return path;
  const url = new URL(path, `http://openimis${currentPathname}`);
  return url.pathname + url.search + url.hash;
}

function joinBasename(basename, path) {
  if (!basename || basename === "/") return path;
  return basename.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);
}

/**
 * react-router 5's `history`. Its identity does not change with the location,
 * as with react-router 5, so effects that depend on it do not re-run.
 */
export function useHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { basename } = useContext(UNSAFE_NavigationContext);
  const current = useRef({});
  current.current = { navigate, location, basename };

  return useMemo(() => {
    const go = (to, state, replace) => {
      const { pathname } = current.current.location;
      if (to && typeof to === "object") {
        const { state: locationState, ...path } = to;
        if (path.pathname) path.pathname = resolveRelative(path.pathname, pathname);
        current.current.navigate(path, { replace, state: state ?? locationState });
      } else {
        current.current.navigate(resolveRelative(to, pathname), { replace, state });
      }
    };
    return {
      push: (to, state) => go(to, state, false),
      replace: (to, state) => go(to, state, true),
      go: (delta) => current.current.navigate(delta),
      goBack: () => current.current.navigate(-1),
      back: () => current.current.navigate(-1),
      goForward: () => current.current.navigate(1),
      forward: () => current.current.navigate(1),
      createHref: (to) => joinBasename(current.current.basename, typeof to === "string" ? to : createPath(to)),
      // `prompt(location, action)` returning false cancels the navigation; the
      // returned function unblocks. Enforced by <HistoryBlocker />, which the app
      // mounts in its data router; without one, block() registers but blocks nothing.
      block: (prompt) => {
        if (typeof prompt !== "function") return () => {};
        blockers.add(prompt);
        return () => {
          blockers.delete(prompt);
        };
      },
      get location() {
        return current.current.location;
      },
    };
  }, []);
}

export { withHistory };
export default function withHistory(C) {
  return (props) => {
    const history = useHistory();
    return <C {...props} history={history} />;
  };
}

/** Cancels the navigations a history.block() callback refuses. Mount once, inside a data router. */
export function HistoryBlocker() {
  const blocker = useBlocker(({ nextLocation, historyAction }) => {
    for (const prompt of blockers) {
      if (prompt(nextLocation, historyAction) === false) return true;
    }
    return false;
  });
  useEffect(() => {
    if (blocker.state === "blocked") blocker.reset();
  }, [blocker]);
  return null;
}

const RouteMatchContext = createContext(null);

/**
 * Without a pattern: the match of the enclosing route (rendered by RouteProps).
 * With one (a path, an array of paths, or { path, exact, sensitive }): whether the
 * current location matches it, in react-router 5's { path, url, params, isExact } shape.
 */
export function useRouteMatch(pattern) {
  const { pathname } = useLocation();
  const routeMatch = useContext(RouteMatchContext);
  if (pattern === undefined) return routeMatch;
  for (const p of Array.isArray(pattern) ? pattern : [pattern]) {
    const { path, exact = false, sensitive = false } = typeof p === "string" ? { path: p } : p;
    const match = matchPath({ path, end: exact, caseSensitive: sensitive }, pathname);
    if (match) {
      return {
        path,
        url: match.pathnameBase,
        params: { ...match.params },
        isExact: match.pathname.replace(/\/+$/, "") === pathname.replace(/\/+$/, ""),
      };
    }
  }
  return null;
}

/** Renders `render({ history, location, match })`, react-router 5's route props, for the route at `path`. */
export function RouteProps({ path, render }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const match = useMemo(
    () => ({
      path,
      url: matchPath({ path, end: false }, location.pathname)?.pathnameBase ?? location.pathname,
      params: { ...params },
      isExact: true,
    }),
    [path, location.pathname, params],
  );
  return <RouteMatchContext.Provider value={match}>{render({ history, location, match })}</RouteMatchContext.Provider>;
}

/** react-router 5's <Redirect>: replaces the current entry, or pushes with `push`. */
export function Redirect({ to, push = false }) {
  return <Navigate to={to} replace={!push} />;
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
