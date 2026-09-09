import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SAML_LOGOUT_PATH } from "../constants";

const BASE_API_URL = "/api";
const clearExpiredSession = vi.fn();
const clearLocalStorage = vi.fn();

vi.mock("./api", () => ({ clearExpiredSession: (...a) => clearExpiredSession(...a) }));
vi.mock("./useLocalStorage", () => ({ clearLocalStorage: (...a) => clearLocalStorage(...a) }));
vi.mock("../actions", () => ({ baseApiUrl: "/api", logout: () => ({ type: "LOGOUT" }) }));

import {
  ensureArray,
  getDecimalPlaces,
  getLanguageNameByCode,
  getMenuText,
  getPublicUrl,
  getTimeDifferenceInDays,
  getTimeDifferenceInDaysFromToday,
  GetIconFromId,
  GetRightsFromId,
  GetRouteFromId,
  GetTextFromId,
  isEmptyObject,
  isUnauthenticatedRoute,
  menuEntryMatchesLocationPath,
  parseLocalizedNumber,
  prepareForComparison,
  prepareMenuEntries,
  redirectToLogin,
  handleBootLogout,
  onLogout,
  redirectToSamlLogout,
} from "./utils";

const at = (pathname) => window.history.pushState({}, "", pathname);
const intl = { formatMessage: ({ id, defaultMessage }) => `[${id}|${defaultMessage ?? ""}]` };

afterEach(() => {
  vi.unstubAllEnvs();
  at("/");
});

describe("ensureArray", () => {
  it("passes an array through untouched", () => {
    const arr = [1, 2];
    expect(ensureArray(arr)).toBe(arr);
  });

  it("wraps a scalar", () => {
    expect(ensureArray("x")).toEqual(["x"]);
    expect(ensureArray(0)).toEqual([0]);
    expect(ensureArray(false)).toEqual([false]);
  });

  it("maps null and undefined to an empty array", () => {
    expect(ensureArray(null)).toEqual([]);
    expect(ensureArray(undefined)).toEqual([]);
  });
});

describe("GetXFromId helpers", () => {
  const routes = { "insuree.route": { rights: ["101"], text: "menu.insuree", path: "insurees", icon: "People" } };

  it("prefers the explicit config over the route table", () => {
    expect(GetRightsFromId(["999"], routes, "insuree.route")).toEqual(["999"]);
    expect(GetTextFromId("explicit", routes, "insuree.route")).toBe("explicit");
    expect(GetRouteFromId("custom", routes, "insuree.route")).toBe("custom");
    expect(GetIconFromId("Star", routes, "insuree.route")).toBe("Star");
  });

  it("falls back to the route table", () => {
    expect(GetRightsFromId(null, routes, "insuree.route")).toEqual(["101"]);
    expect(GetTextFromId(undefined, routes, "insuree.route")).toBe("menu.insuree");
    expect(GetRouteFromId(null, routes, "insuree.route")).toBe("insurees");
    expect(GetIconFromId(null, routes, "insuree.route")).toBe("People");
  });

  it("returns undefined for an unknown id instead of throwing", () => {
    expect(GetRouteFromId(null, routes, "nope")).toBeUndefined();
    expect(GetRouteFromId(null, {}, "nope")).toBeUndefined();
  });
});

describe("getMenuText", () => {
  it("returns a React element unchanged", () => {
    const element = React.createElement("span", null, "hi");
    expect(getMenuText(element, intl)).toBe(element);
  });

  it("returns undefined for empty text", () => {
    expect(getMenuText("", intl)).toBeUndefined();
    expect(getMenuText(undefined, intl)).toBeUndefined();
  });

  it("looks up the full key, falling back to the module-stripped one", () => {
    // "insuree.menu.label" -> module "insuree", inner id "menu.label"
    expect(getMenuText("insuree.menu.label", intl)).toBe("[insuree.menu.label|[menu.label|insuree.menu.label]]");
  });

  it("uses the whole string as the id when there is no dot", () => {
    expect(getMenuText("label", intl)).toBe("[label|[label|label]]");
  });
});

describe("prepareMenuEntries", () => {
  const routes = { "insuree.route": { path: "insurees", rights: ["101"], icon: "People" } };

  it("keeps entries the user has any matching right for", () => {
    const entries = [
      { id: "a", route: "allowed", rights: ["101"], icon: "People" },
      { id: "b", route: "denied", rights: ["999"], icon: "People" },
    ];

    expect(prepareMenuEntries(["101"], intl, entries, routes).map((e) => e.id)).toEqual(["a"]);
  });

  it("compares rights as strings, so numeric rights still match", () => {
    const entries = [{ id: "a", route: "allowed", rights: [101], icon: "People" }];

    expect(prepareMenuEntries(["101"], intl, entries, routes)).toHaveLength(1);
  });

  it("keeps entries that declare no rights at all", () => {
    const entries = [{ id: "a", route: "public", icon: "People" }];

    expect(prepareMenuEntries([], intl, entries, {})).toHaveLength(1);
  });

  it("drops entries with neither route nor id", () => {
    expect(prepareMenuEntries(["101"], intl, [{ text: "orphan" }], {})).toEqual([]);
  });

  it("sorts by position, defaulting a missing position to 99", () => {
    const entries = [
      { id: "last", route: "c", position: 100, icon: "People" },
      { id: "unpositioned", route: "b", icon: "People" },
      { id: "first", route: "a", position: 1, icon: "People" },
    ];

    expect(prepareMenuEntries([], intl, entries, {}).map((e) => e.id)).toEqual(["first", "unpositioned", "last"]);
  });

  it("prefixes the route with a slash", () => {
    expect(prepareMenuEntries([], intl, [{ id: "a", route: "insurees", icon: "People" }], {})[0].route).toBe(
      "/insurees",
    );
  });

  it("resolves the route from the route table when the entry has only an id", () => {
    expect(prepareMenuEntries(["101"], intl, [{ id: "insuree.route" }], routes)[0].route).toBe("/insurees");
  });

  it("falls back to a default icon and warns when an entry has none", () => {
    // Child menu entries routinely omit icons, so this path is hit in normal use.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const [entry] = prepareMenuEntries([], intl, [{ id: "a", route: "no-icon" }], {});

    expect(entry.icon).toBeDefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("falling back to Add icon"));
  });

  // Currently fails: the "/" prefix is added unconditionally.
  it.fails("does not double-slash a route that already starts with one", () => {
    expect(prepareMenuEntries([], intl, [{ id: "a", route: "/insurees", icon: "People" }], {})[0].route).toBe(
      "/insurees",
    );
  });
});

describe("prepareForComparison", () => {
  it("strips roleRights from the state role and normalises isSystem", () => {
    const result = prepareForComparison({ id: 1, roleRights: [1, 2] }, { id: 1 }, [{ rightId: 101 }, { rightId: 102 }]);

    expect(result.stateRole).toEqual({ id: 1 });
    expect(result.propsRole).toEqual({ id: 1, isSystem: false });
    expect(result.convertedRoleRights).toEqual([101, 102]);
  });

  it("coerces a truthy isSystem to a boolean", () => {
    expect(prepareForComparison({}, { isSystem: 1 }, []).propsRole.isSystem).toBe(true);
  });

  it("defaults roleRights to an empty array", () => {
    expect(prepareForComparison({}, {}, null).convertedRoleRights).toEqual([]);
    expect(prepareForComparison({}, {}, undefined).convertedRoleRights).toEqual([]);
  });
});

describe("getTimeDifferenceInDays", () => {
  it("returns whole days between two dates", () => {
    expect(getTimeDifferenceInDays("2026-01-10", "2026-01-01")).toBe(9);
  });

  it("is negative when the first date is earlier", () => {
    expect(getTimeDifferenceInDays("2026-01-01", "2026-01-10")).toBe(-9);
  });

  it("rounds a partial day up", () => {
    expect(getTimeDifferenceInDays("2026-01-02T01:00:00Z", "2026-01-01T00:00:00Z")).toBe(2);
  });

  it("measures against now in the FromToday variant", () => {
    const inTenDays = new Date(Date.now() + 10 * 86400000).toISOString();

    expect(getTimeDifferenceInDaysFromToday(inTenDays)).toBe(10);
  });
});

describe("getPublicUrl", () => {
  it("is empty when PUBLIC_URL is unset or root", () => {
    vi.stubEnv("PUBLIC_URL", "");
    expect(getPublicUrl()).toBe("");

    vi.stubEnv("PUBLIC_URL", "/");
    expect(getPublicUrl()).toBe("");
  });

  it("passes through an absolute prefix", () => {
    vi.stubEnv("PUBLIC_URL", "/front");
    expect(getPublicUrl()).toBe("/front");
  });

  it("adds a leading slash to a relative prefix", () => {
    vi.stubEnv("PUBLIC_URL", "front");
    expect(getPublicUrl()).toBe("/front");
  });
});

describe("isUnauthenticatedRoute", () => {
  it.each(["/login", "/logout", "/forgot_password", "/set_password"])("recognises %s", (path) => {
    at(path);
    expect(isUnauthenticatedRoute()).toBe(true);
  });

  it("recognises the route behind a public url prefix", () => {
    vi.stubEnv("PUBLIC_URL", "/front");
    at("/front/login");

    expect(isUnauthenticatedRoute()).toBe(true);
  });

  it("rejects an authenticated route", () => {
    at("/insurees");
    expect(isUnauthenticatedRoute()).toBe(false);
  });
});

describe("getLanguageNameByCode", () => {
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
  ];

  it("finds the name", () => {
    expect(getLanguageNameByCode(languages, "fr")).toBe("French");
  });

  it("returns undefined for an unknown code", () => {
    expect(getLanguageNameByCode(languages, "de")).toBeUndefined();
  });
});

describe("isEmptyObject", () => {
  it("distinguishes empty from populated", () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject({ a: 1 })).toBe(false);
  });
});

describe("getDecimalPlaces", () => {
  it("counts decimals on a number", () => {
    expect(getDecimalPlaces(1.25)).toBe(2);
    expect(getDecimalPlaces(100)).toBe(0);
  });

  it("preserves trailing zeros when given a string", () => {
    // A number would normalise 1.250 to 1.25; the string form must not.
    expect(getDecimalPlaces("1.250")).toBe(3);
    expect(getDecimalPlaces(1.25)).toBe(2);
  });

  it("returns 0 for nullish or non-numeric input", () => {
    expect(getDecimalPlaces(null)).toBe(0);
    expect(getDecimalPlaces(undefined)).toBe(0);
    expect(getDecimalPlaces("abc")).toBe(0);
  });

  // Currently fails: decimals are counted from String(Number(v)), which goes exponential.
  it.fails("counts decimals on values JS renders in exponential form", () => {
    expect(getDecimalPlaces(1e-7)).toBe(7);
  });
});

describe("parseLocalizedNumber", () => {
  it("parses an en-style number", () => {
    expect(parseLocalizedNumber("1,234.56", "en")).toBe(1234.56);
  });

  it("parses a de-style number where the separators are swapped", () => {
    expect(parseLocalizedNumber("1.234,56", "de")).toBe(1234.56);
  });

  it("strips whitespace, including the narrow no-break space used by fr", () => {
    expect(parseLocalizedNumber("1 234,56", "fr")).toBe(1234.56);
    expect(parseLocalizedNumber("1\u202f234,56", "fr")).toBe(1234.56);
  });

  it("returns NaN for empty input", () => {
    expect(parseLocalizedNumber(null)).toBeNaN();
    expect(parseLocalizedNumber("")).toBeNaN();
  });

  it("handles a plain integer", () => {
    expect(parseLocalizedNumber("42", "en")).toBe(42);
  });
});

describe("menuEntryMatchesLocationPath", () => {
  it("matches an exact path", () => {
    at("/insurees");
    expect(menuEntryMatchesLocationPath({ route: "/insurees" })).toBe(true);
  });

  it("matches a child path", () => {
    at("/insurees/42");
    expect(menuEntryMatchesLocationPath({ route: "/insurees" })).toBe(true);
  });

  it("does not match a path that merely shares a prefix", () => {
    at("/insureesArchive");
    expect(menuEntryMatchesLocationPath({ route: "/insurees" })).toBe(false);
  });

  it("normalises a route with no leading slash", () => {
    at("/insurees");
    expect(menuEntryMatchesLocationPath({ route: "insurees" })).toBe(true);
  });

  it("accounts for the public url prefix", () => {
    vi.stubEnv("PUBLIC_URL", "/front");
    at("/front/insurees");

    expect(menuEntryMatchesLocationPath({ route: "/insurees" })).toBe(true);
  });

  it("resolves the route from the route table when the entry has only an id", () => {
    at("/insurees");
    expect(menuEntryMatchesLocationPath({ id: "insuree.route" }, { "insuree.route": { path: "insurees" } })).toBe(true);
  });

  it("ignores query string and hash", () => {
    at("/insurees?page=2");
    expect(menuEntryMatchesLocationPath({ route: "/insurees" })).toBe(true);
  });

  it("returns false for entries it cannot resolve a route for", () => {
    at("/insurees");
    expect(menuEntryMatchesLocationPath({ id: "unknown" }, {})).toBe(false);
    expect(menuEntryMatchesLocationPath(null)).toBe(false);
    expect(menuEntryMatchesLocationPath("nope")).toBe(false);
  });
});

describe("session and navigation helpers", () => {
  const realLocation = window.location;
  const stubLocation = (props) =>
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { origin: "http://localhost", pathname: "/", href: "", replace: vi.fn(), ...props },
    });

  afterEach(() =>
    Object.defineProperty(window, "location", { configurable: true, writable: true, value: realLocation }),
  );

  describe("redirectToLogin", () => {
    it("clears the session before navigating", async () => {
      stubLocation({ pathname: "/insurees" });

      await redirectToLogin();

      expect(clearExpiredSession).toHaveBeenCalled();
      expect(window.location.replace).toHaveBeenCalledWith("/login");
    });

    it("prefixes the public url", async () => {
      vi.stubEnv("PUBLIC_URL", "/front");
      stubLocation({ pathname: "/front/insurees" });

      await redirectToLogin();

      expect(window.location.replace).toHaveBeenCalledWith("/front/login");
    });

    it("does not navigate when already on an unauthenticated page", async () => {
      stubLocation({ pathname: "/login" });

      await redirectToLogin();

      expect(clearExpiredSession).toHaveBeenCalled();
      expect(window.location.replace).not.toHaveBeenCalled();
    });
  });

  describe("handleBootLogout", () => {
    it("redirects and reports handled when booting on the logout route", () => {
      stubLocation({ pathname: "/logout" });

      expect(handleBootLogout()).toBe(true);
      expect(clearExpiredSession).toHaveBeenCalled();
    });

    it("recognises the logout route behind a public url", () => {
      vi.stubEnv("PUBLIC_URL", "/front");
      stubLocation({ pathname: "/front/logout" });

      expect(handleBootLogout()).toBe(true);
    });

    it("does nothing on any other route", () => {
      stubLocation({ pathname: "/insurees" });

      expect(handleBootLogout()).toBe(false);
      expect(clearExpiredSession).not.toHaveBeenCalled();
    });
  });

  describe("onLogout", () => {
    it("clears storage and dispatches the logout action", async () => {
      const dispatch = vi.fn().mockResolvedValue(undefined);

      await onLogout(dispatch);

      expect(clearLocalStorage).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith({ type: "LOGOUT" });
    });

    it("waits for the dispatch to settle", async () => {
      let settled = false;
      const dispatch = vi.fn(() => Promise.resolve().then(() => (settled = true)));

      await onLogout(dispatch);

      expect(settled).toBe(true);
    });
  });

  describe("redirectToSamlLogout", () => {
    it("suppresses the default link behaviour, clears storage and navigates", () => {
      stubLocation({ origin: "https://openimis.test" });
      const event = { preventDefault: vi.fn() };

      redirectToSamlLogout(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(clearLocalStorage).toHaveBeenCalled();
      expect(window.location.href).toBe(`https://openimis.test${BASE_API_URL}${SAML_LOGOUT_PATH}`);
    });
  });
});
