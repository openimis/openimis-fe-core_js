// Resolution rules of `core.ComponentOverrides`. Pure module (no imports) so
// it runs under `node --test`; helpers/overrides.js renders the results.
//
// An override entry is `{ key, component }` (replaces the overridable
// component or ref published under `key`) or `{ path, component }` (replaces
// the component of the `core.Router` routes whose path is exactly `path`).
// A resolution is `{ component, scoped?, scopeDefault?, passDefault? }`:
// - `scoped`: render `component` in an override scope where `key` resolves to
//   `scopeDefault`, so the replacement can reach the original;
// - `passDefault`: also give `component` the original as `DefaultComponent`.

// `report(level, message)` receives each configuration error.
export function buildOverrideIndex(entries = [], report = () => {}) {
  const byKey = new Map();
  const byPath = new Map();
  entries.forEach((entry) => {
    if (!entry || !entry.component || (!entry.key && !entry.path) || (entry.key && entry.path)) {
      report("error", `core.ComponentOverrides: ignored entry ${describeEntry(entry)}; it needs a component and either a key or a path`);
      return;
    }
    const [map, target] = entry.key ? [byKey, entry.key] : [byPath, entry.path];
    if (map.has(target)) {
      report("error", `core.ComponentOverrides: ${target} is overridden more than once; the last one is used`);
    }
    map.set(target, entry.component);
  });
  return { byKey, byPath };
}

const describeEntry = (entry) => {
  if (!entry) return String(entry);
  return entry.key || entry.path ? `for ${entry.key || entry.path}` : "without key or path";
};

const isWrapperOf = (component, key) => !!component && component.overridableKey === key;

// Component rendered by an `overridable(key)` wrapper around `defaultComponent`:
// the scoped default inside an override of `key`, then the declared override,
// then a ref of the same key that is not a wrapper of `key`, then the default.
export function resolveOverridable({ key, scope, override, ref, defaultComponent }) {
  if (scope && scope.has(key)) return { component: scope.get(key) };
  if (override) return { component: override, scoped: true, scopeDefault: defaultComponent, passDefault: true };
  if (ref && !isWrapperOf(ref, key)) {
    return { component: ref, scoped: true, scopeDefault: defaultComponent, passDefault: false };
  }
  return { component: defaultComponent };
}

// Component rendered for a published ref `key` (PublishedComponent, string
// route components): the scoped default inside an override of `key`, then the
// ref itself when it is an overridable wrapper (it resolves on its own), then
// the declared override around the ref, then the ref.
export function resolvePublished({ key, scope, override, ref }) {
  if (scope && scope.has(key)) return { component: scope.get(key) };
  if (isWrapperOf(ref, key)) return { component: ref };
  if (override) return { component: override, scoped: true, scopeDefault: ref, passDefault: true };
  return { component: ref };
}

// Warnings for overrides that match nothing and for duplicate route paths.
// `isKnownKey(key)` tells whether an overridable wrapper or a ref uses `key`.
export function overrideWarnings({ byKey, byPath }, routePaths, isKnownKey) {
  const warnings = [];
  byKey.forEach((_, key) => {
    if (!isKnownKey(key)) {
      warnings.push(`core.ComponentOverrides: no overridable component or ref is published as ${key}`);
    }
  });
  const paths = new Set(routePaths);
  byPath.forEach((_, path) => {
    if (!paths.has(path)) {
      warnings.push(`core.ComponentOverrides: no core.Router route has the path ${path}`);
    }
  });
  const seen = new Set();
  const duplicates = new Set();
  routePaths.forEach((path) => (seen.has(path) ? duplicates.add(path) : seen.add(path)));
  duplicates.forEach((path) => {
    warnings.push(`core.Router: the path ${path} is registered more than once; the first registration is rendered`);
  });
  return warnings;
}
