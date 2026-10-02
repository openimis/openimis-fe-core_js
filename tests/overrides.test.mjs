import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import {
  buildOverrideIndex,
  overrideWarnings,
  resolveOverridable,
  resolvePublished,
} from "../src/helpers/overrideResolution.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Compiles the React layer (helpers/overrides.js and what it imports) to
// CommonJS under node_modules/.cache, where `react` resolves.
function loadOverrides() {
  const babel = require("@babel/core");
  const out = path.join(root, "node_modules", ".cache", "overrides-test");
  fs.mkdirSync(out, { recursive: true });
  ["overrides.js", "overrideResolution.js", "modules.js"].forEach((file) => {
    const { code } = babel.transformFileSync(path.join(root, "src", "helpers", file), {
      babelrc: false,
      configFile: false,
      presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-react"],
      plugins: ["@babel/plugin-proposal-class-properties"],
    });
    fs.writeFileSync(path.join(out, file), code);
  });
  return {
    overrides: require(path.join(out, "overrides.js")),
    modules: require(path.join(out, "modules.js")),
  };
}

const { overrides, modules } = loadOverrides();
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const h = React.createElement;

const modulesManager = ({ overrides: entries = [], refs = {} } = {}) => ({
  getContribs: (key) => (key === "core.ComponentOverrides" ? entries : []),
  getRef: (key) => refs[key],
});
const render = (mm, element) => renderToStaticMarkup(h(modules.ModulesManagerProvider, { value: mm }, element));
const Text = (text) => (props) => h("span", null, `${text}:${props.label || ""}`);
const published = (mm, key, props = {}) =>
  function Published() {
    return overrides.renderPublished(mm, key, overrides.useOverrideScope(), props);
  };
const silenced = (fn) => {
  const { warn, error } = console;
  const logged = [];
  console.warn = (m) => logged.push(["warn", m]);
  console.error = (m) => logged.push(["error", m]);
  try {
    return [fn(), logged];
  } finally {
    Object.assign(console, { warn, error });
  }
};

test("an overridable component renders its default when nothing replaces it", () => {
  const Page = overrides.overridable("t.Default")(Text("default"));
  assert.equal(render(modulesManager(), h(Page, { label: "x" })), "<span>default:x</span>");
});

test("a declared override wins over the default and over a ref of the same key", () => {
  const Page = overrides.overridable("t.Declared")(Text("default"));
  const mm = modulesManager({
    overrides: [{ key: "t.Declared", component: Text("override") }],
    refs: { "t.Declared": Text("legacy") },
  });
  assert.equal(render(mm, h(Page, { label: "x" })), "<span>override:x</span>");
});

test("the override receives the original as DefaultComponent", () => {
  const Page = overrides.overridable("t.Decorate")(Text("default"));
  const Decorator = ({ DefaultComponent, ...props }) => h("div", null, h(DefaultComponent, props));
  const mm = modulesManager({ overrides: [{ key: "t.Decorate", component: Decorator }] });
  assert.equal(render(mm, h(Page, { label: "x" })), "<div><span>default:x</span></div>");
});

test("an override rendering the wrapped component again gets the original, not itself", () => {
  const Page = overrides.overridable("t.Nested")(Text("default"));
  const Again = (props) => h("div", null, h(Page, props));
  const mm = modulesManager({ overrides: [{ key: "t.Nested", component: Again }] });
  assert.equal(render(mm, h(Page, { label: "x" })), "<div><span>default:x</span></div>");
});

test("a ref of the same key replaces the default when no override is declared", () => {
  const Page = overrides.overridable("t.Legacy")(Text("default"));
  const mm = modulesManager({ refs: { "t.Legacy": Text("legacy") } });
  assert.equal(render(mm, h(Page, {})), "<span>legacy:</span>");
});

test("a wrapper registered as its own ref renders the default, directly or as a published ref", () => {
  const Page = overrides.overridable("t.Self")(Text("default"));
  const mm = modulesManager({ refs: { "t.Self": Page } });
  assert.equal(render(mm, h(Page, {})), "<span>default:</span>");
  assert.equal(render(mm, h(published(mm, "t.Self"))), "<span>default:</span>");
});

test("an override rendering its own key as a published ref gets the original", () => {
  const mm = modulesManager({
    overrides: [{ key: "t.Pages", component: (props) => h("div", null, h(published(mm, "t.Pages", props))) }],
    refs: { "t.Pages": Text("original") },
  });
  assert.equal(render(mm, h(published(mm, "t.Pages", { label: "x" }))), "<div><span>original:x</span></div>");
});

test("a published ref without override renders the ref, and nothing when it is missing", () => {
  const mm = modulesManager({ refs: { "t.Picker": Text("picker") } });
  assert.equal(render(mm, h(published(mm, "t.Picker"))), "<span>picker:</span>");
  assert.equal(render(mm, h(published(mm, "t.Missing"))), "");
});

test("a path override swaps the route component and leaves the route object as it is", () => {
  const Route = Text("route");
  const Override = ({ DefaultComponent }) => h("div", null, h(DefaultComponent, { label: "inner" }));
  const mm = modulesManager({ overrides: [{ path: "items", component: Override }] });
  const route = { path: "items", component: Route, requiredRights: [1] };
  const duplicate = { path: "items", component: Text("duplicate") };
  assert.equal(render(mm, h(overrides.routeComponent(mm, route))), "<div><span>route:inner</span></div>");
  assert.equal(render(mm, h(overrides.routeComponent(mm, duplicate))), "<div><span>duplicate:inner</span></div>");
  assert.deepEqual(route, { path: "items", component: Route, requiredRights: [1] });
});

test("a string route component resolves as a ref, and to null with a warning when missing", () => {
  const mm = modulesManager({ refs: { "t.RoutePage": Text("page") } });
  assert.equal(render(mm, h(overrides.routeComponent(mm, { path: "page", component: "t.RoutePage" }))), "<span>page:</span>");
  const [missing, logged] = silenced(() => overrides.routeComponent(mm, { path: "gone", component: "t.Gone" }));
  assert.equal(missing, null);
  assert.equal(logged.length, 1);
});

test("an entry without component, or with both key and path, is reported and ignored", () => {
  const reports = [];
  const index = buildOverrideIndex(
    [{ key: "a" }, { key: "b", path: "b", component: 1 }, { component: 1 }, { key: "c", component: 1 }],
    (level) => reports.push(level),
  );
  assert.deepEqual(reports, ["error", "error", "error"]);
  assert.deepEqual([...index.byKey.keys()], ["c"]);
});

test("two overrides of one target are reported and the last one is used", () => {
  const reports = [];
  const index = buildOverrideIndex(
    [
      { key: "a", component: 1 },
      { key: "a", component: 2 },
    ],
    (level) => reports.push(level),
  );
  assert.deepEqual(reports, ["error"]);
  assert.equal(index.byKey.get("a"), 2);
});

test("overrides that match nothing and duplicate route paths are warned about", () => {
  const index = buildOverrideIndex([
    { key: "known", component: 1 },
    { key: "unknown", component: 1 },
    { path: "items", component: 1 },
    { path: "nowhere", component: 1 },
  ]);
  const warnings = overrideWarnings(index, ["items", "other", "other"], (key) => key === "known");
  assert.equal(warnings.length, 3);
  assert.match(warnings[0], /unknown/);
  assert.match(warnings[1], /nowhere/);
  assert.match(warnings[2], /other/);
});

test("a declared key counts as known for the boot validation", () => {
  overrides.overridable("t.Validated")(Text("default"));
  const mm = modulesManager({ overrides: [{ key: "t.Validated", component: Text("o") }] });
  const [, logged] = silenced(() => overrides.validateOverrides(mm, [{ path: "a" }]));
  assert.deepEqual(logged, []);
});

test("resolution rules", () => {
  const scope = new Map([["k", "scoped"]]);
  const wrapper = { overridableKey: "k" };
  assert.deepEqual(resolveOverridable({ key: "k", scope, override: "o", ref: "r", defaultComponent: "d" }), {
    component: "scoped",
  });
  assert.equal(resolveOverridable({ key: "k", scope: new Map(), ref: wrapper, defaultComponent: "d" }).component, "d");
  assert.equal(resolvePublished({ key: "k", scope: new Map(), override: "o", ref: wrapper }).component, wrapper);
  assert.deepEqual(resolvePublished({ key: "k", scope: new Map(), override: "o", ref: "r" }), {
    component: "o",
    scoped: true,
    scopeDefault: "r",
    passDefault: true,
  });
});
