import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ModulesManagerProvider } from "./modules";
import { overridable, renderPublished, routeComponent, useOverrideScope, validateOverrides } from "./overrides";
import { buildOverrideIndex, overrideWarnings, resolveOverridable, resolvePublished } from "./overrideResolution";

const modulesManager = ({ overrides = [], refs = {} } = {}) => ({
  getContribs: (key) => (key === "core.ComponentOverrides" ? overrides : []),
  getRef: (key) => refs[key],
});
const render = (mm, element) => renderToStaticMarkup(<ModulesManagerProvider value={mm}>{element}</ModulesManagerProvider>);
const Text = (text) => (props) => <span>{`${text}:${props.label || ""}`}</span>;
const published = (mm, key, props = {}) =>
  function Published() {
    return renderPublished(mm, key, useOverrideScope(), props);
  };

describe("overridable", () => {
  it("renders its default when nothing replaces it", () => {
    const Page = overridable("t.Default")(Text("default"));
    expect(render(modulesManager(), <Page label="x" />)).toBe("<span>default:x</span>");
  });

  it("renders a declared override rather than the default or a ref of the same key", () => {
    const Page = overridable("t.Declared")(Text("default"));
    const mm = modulesManager({
      overrides: [{ key: "t.Declared", component: Text("override") }],
      refs: { "t.Declared": Text("legacy") },
    });
    expect(render(mm, <Page label="x" />)).toBe("<span>override:x</span>");
  });

  it("gives the override the original as DefaultComponent", () => {
    const Page = overridable("t.Decorate")(Text("default"));
    const Decorator = ({ DefaultComponent, ...props }) => (
      <div>
        <DefaultComponent {...props} />
      </div>
    );
    const mm = modulesManager({ overrides: [{ key: "t.Decorate", component: Decorator }] });
    expect(render(mm, <Page label="x" />)).toBe("<div><span>default:x</span></div>");
  });

  it("renders the original when the override renders the wrapped component again", () => {
    const Page = overridable("t.Nested")(Text("default"));
    const Again = (props) => (
      <div>
        <Page {...props} />
      </div>
    );
    const mm = modulesManager({ overrides: [{ key: "t.Nested", component: Again }] });
    expect(render(mm, <Page label="x" />)).toBe("<div><span>default:x</span></div>");
  });

  it("renders a ref of the same key when no override is declared", () => {
    const Page = overridable("t.Legacy")(Text("default"));
    expect(render(modulesManager({ refs: { "t.Legacy": Text("legacy") } }), <Page />)).toBe("<span>legacy:</span>");
  });

  it("renders the default when it is registered as its own ref", () => {
    const Page = overridable("t.Self")(Text("default"));
    const mm = modulesManager({ refs: { "t.Self": Page } });
    expect(render(mm, <Page />)).toBe("<span>default:</span>");
    const Published = published(mm, "t.Self");
    expect(render(mm, <Published />)).toBe("<span>default:</span>");
  });
});

describe("published refs", () => {
  it("give an override that renders its own key the original", () => {
    const mm = modulesManager({
      overrides: [
        {
          key: "t.Pages",
          component: (props) => {
            const Original = published(mm, "t.Pages", props);
            return (
              <div>
                <Original />
              </div>
            );
          },
        },
      ],
      refs: { "t.Pages": Text("original") },
    });
    const Published = published(mm, "t.Pages", { label: "x" });
    expect(render(mm, <Published />)).toBe("<div><span>original:x</span></div>");
  });

  it("render the ref without override, and nothing when it is missing", () => {
    const mm = modulesManager({ refs: { "t.Picker": Text("picker") } });
    const Picker = published(mm, "t.Picker");
    const Missing = published(mm, "t.Missing");
    expect(render(mm, <Picker />)).toBe("<span>picker:</span>");
    expect(render(mm, <Missing />)).toBe("");
  });
});

describe("routeComponent", () => {
  it("swaps the component of every route with the overridden path and leaves the route object as it is", () => {
    const Route = Text("route");
    const Override = ({ DefaultComponent }) => (
      <div>
        <DefaultComponent label="inner" />
      </div>
    );
    const mm = modulesManager({ overrides: [{ path: "items", component: Override }] });
    const route = { path: "items", component: Route, rights: [1] };
    const First = routeComponent(mm, route);
    const Second = routeComponent(mm, { path: "items", component: Text("duplicate") });
    expect(render(mm, <First />)).toBe("<div><span>route:inner</span></div>");
    expect(render(mm, <Second />)).toBe("<div><span>duplicate:inner</span></div>");
    expect(route).toEqual({ path: "items", component: Route, rights: [1] });
  });

  it("resolves a string component as a ref, and returns null with a warning when nothing is published", () => {
    const mm = modulesManager({ refs: { "t.RoutePage": Text("page") } });
    const Page = routeComponent(mm, { path: "page", component: "t.RoutePage" });
    expect(render(mm, <Page />)).toBe("<span>page:</span>");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(routeComponent(mm, { path: "gone", component: "t.Gone" })).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("configuration checks", () => {
  it("reports and ignores an entry without component, or with both key and path", () => {
    const reports = [];
    const index = buildOverrideIndex(
      [{ key: "a" }, { key: "b", path: "b", component: 1 }, { component: 1 }, { key: "c", component: 1 }],
      (level) => reports.push(level),
    );
    expect(reports).toEqual(["error", "error", "error"]);
    expect([...index.byKey.keys()]).toEqual(["c"]);
  });

  it("reports two overrides of one target and keeps the last one", () => {
    const reports = [];
    const index = buildOverrideIndex(
      [
        { key: "a", component: 1 },
        { key: "a", component: 2 },
      ],
      (level) => reports.push(level),
    );
    expect(reports).toEqual(["error"]);
    expect(index.byKey.get("a")).toBe(2);
  });

  it("warns about overrides that match nothing and duplicate route paths", () => {
    const index = buildOverrideIndex([
      { key: "known", component: 1 },
      { key: "unknown", component: 1 },
      { path: "items", component: 1 },
      { path: "nowhere", component: 1 },
    ]);
    const warnings = overrideWarnings(index, ["items", "other", "other"], (key) => key === "known");
    expect(warnings).toHaveLength(3);
    expect(warnings[0]).toMatch(/unknown/);
    expect(warnings[1]).toMatch(/nowhere/);
    expect(warnings[2]).toMatch(/other/);
  });

  it("counts a declared overridable key as known", () => {
    overridable("t.Validated")(Text("default"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    validateOverrides(modulesManager({ overrides: [{ key: "t.Validated", component: Text("o") }] }), [{ path: "a" }]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("resolution rules", () => {
  it("prefer the scope, then the override, then a foreign ref, then the default", () => {
    const wrapper = { overridableKey: "k" };
    expect(
      resolveOverridable({ key: "k", scope: new Map([["k", "scoped"]]), override: "o", ref: "r", defaultComponent: "d" }),
    ).toEqual({ component: "scoped" });
    expect(resolveOverridable({ key: "k", scope: new Map(), ref: wrapper, defaultComponent: "d" }).component).toBe("d");
    expect(resolvePublished({ key: "k", scope: new Map(), override: "o", ref: wrapper }).component).toBe(wrapper);
    expect(resolvePublished({ key: "k", scope: new Map(), override: "o", ref: "r" })).toEqual({
      component: "o",
      scoped: true,
      scopeDefault: "r",
      passDefault: true,
    });
  });
});
