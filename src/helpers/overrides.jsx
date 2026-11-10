import React from "react";
import { useModulesManager } from "./modules";
import {
  buildOverrideIndex,
  overrideWarnings,
  resolveOverridable,
  resolvePublished,
} from "./overrideResolution";

export const COMPONENT_OVERRIDES_CONTRIBUTION_KEY = "core.ComponentOverrides";

const OverrideScopeContext = React.createContext(new Map());
const indexes = new WeakMap();
const declaredKeys = new Set();
const warnedMissingRefs = new Set();

export const useOverrideScope = () => React.useContext(OverrideScopeContext);

// Override entries of a modules manager, indexed once per manager.
export function overrideIndex(modulesManager) {
  let index = indexes.get(modulesManager);
  if (!index) {
    index = buildOverrideIndex(modulesManager.getContribs(COMPONENT_OVERRIDES_CONTRIBUTION_KEY), (level, message) =>
      console[level](message),
    );
    indexes.set(modulesManager, index);
  }
  return index;
}

function renderResolution(resolution, key, scope, props) {
  const { component: Resolved, scoped, scopeDefault, passDefault } = resolution;
  if (!Resolved) return null;
  if (!scoped) return <Resolved {...props} />;
  const nestedScope = new Map(scope);
  nestedScope.set(key, scopeDefault);
  return (
    <OverrideScopeContext.Provider value={nestedScope}>
      {passDefault ? <Resolved {...props} DefaultComponent={scopeDefault} /> : <Resolved {...props} />}
    </OverrideScopeContext.Provider>
  );
}

// Makes `DefaultComponent` replaceable by a `core.ComponentOverrides` entry
// `{ key, component }`. The replacement receives the original as the
// `DefaultComponent` prop; inside it, `key` resolves to the original.
export function overridable(key) {
  return (DefaultComponent) => {
    declaredKeys.add(key);
    const Overridable = (props) => {
      const modulesManager = useModulesManager();
      const scope = useOverrideScope();
      if (!modulesManager) return <DefaultComponent {...props} />;
      const resolution = resolveOverridable({
        key,
        scope,
        override: overrideIndex(modulesManager).byKey.get(key),
        ref: modulesManager.getRef(key),
        defaultComponent: DefaultComponent,
      });
      return renderResolution(resolution, key, scope, props);
    };
    Overridable.overridableKey = key;
    Overridable.displayName = `Overridable(${key})`;
    return Overridable;
  };
}

// Element for the published ref `key`, or null when nothing is published.
export function renderPublished(modulesManager, key, scope, props) {
  const resolution = resolvePublished({
    key,
    scope,
    override: overrideIndex(modulesManager).byKey.get(key),
    ref: modulesManager.getRef(key),
  });
  if (!resolution.component && process.env.NODE_ENV === "development" && !warnedMissingRefs.has(key)) {
    warnedMissingRefs.add(key);
    console.warn(`PublishedComponent: no component is published as ${key}`);
  }
  return renderResolution(resolution, key, scope, props);
}

// Component of a `core.Router` route: a string component is a ref key, and a
// path override receives the route's own component as `DefaultComponent`.
// Returns null, with a warning, when a string component resolves to nothing
// and no path override applies.
export function routeComponent(modulesManager, route) {
  const index = overrideIndex(modulesManager);
  let RouteDefault = route.component;
  if (typeof route.component === "string") {
    const refKey = route.component;
    RouteDefault = null;
    if (modulesManager.getRef(refKey) || index.byKey.has(refKey)) {
      RouteDefault = function PublishedRoute(props) {
        return renderPublished(modulesManager, refKey, useOverrideScope(), props);
      };
    }
  }
  const PathOverride = index.byPath.get(route.path);
  if (PathOverride) {
    return function OverriddenRoute(props) {
      return <PathOverride {...props} DefaultComponent={RouteDefault} />;
    };
  }
  if (!RouteDefault) {
    console.warn(`core.Router: no component is published as ${route.component} for the path ${route.path}`);
  }
  return RouteDefault;
}

// Logs the overrides that match nothing and the duplicate route paths.
export function validateOverrides(modulesManager, routes) {
  overrideWarnings(
    overrideIndex(modulesManager),
    routes.map((route) => route.path),
    (key) => declaredKeys.has(key) || !!modulesManager.getRef(key),
  ).forEach((warning) => console.warn(warning));
}
