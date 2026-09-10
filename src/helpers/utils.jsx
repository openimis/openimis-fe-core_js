import { baseApiUrl, logout } from "../actions";
import { SAML_LOGOUT_PATH } from "../constants";
import GetIconComponent from "./icons";
import React from "react";
import { clearExpiredSession } from "./api";
import { clearLocalStorage } from "./useLocalStorage";

export const ensureArray = (maybeArray) => {
  if (Array.isArray(maybeArray)) {
    return maybeArray;
  } else if (maybeArray !== null && maybeArray !== undefined) {
    return [maybeArray];
  } else {
    return [];
  }
};

export function getMenuText(text, intl) {
  if (React.isValidElement(text)) {
    return text;
  }
  if (text) {
    const [module, ...rest] = text.split(".");
    const message = rest.join(".").trim() || text;
    const fallback = intl.formatMessage({ module: module, id: message, defaultMessage: text });
    return intl.formatMessage({ id: text, defaultMessage: fallback });
  }
}

export function GetRightsFromId(conf, routes, id) {
  return conf || routes[id]?.rights;
}

export function GetTextFromId(conf, routes, id) {
  return conf || routes[id]?.text;
}

export function GetRouteFromId(conf, routes, id) {
  return conf || routes[id]?.path;
}

export function GetIconFromId(conf, routes, id) {
  return conf || routes[id]?.icon;
}

export const MENU_GROUP_TYPE = "group";

// Children of a group entry. `entries` is the canonical shape; `children` is
// accepted as a compatibility alias so consumers (e.g. fe-ledger) can nest a
// submenu without migrating to the group shape.
export function getMenuGroupChildren(entry) {
  if (typeof entry !== "object" || entry === null) return undefined;
  if (Array.isArray(entry.entries)) return entry.entries;
  if (Array.isArray(entry.children)) return entry.children;
  return undefined;
}

// A group is an intermediate level between a main menu and its leaves: it has
// children but no route of its own. Either flag it with type: "group" or simply
// nest an `entries` (or `children`) array in it.
export function isMenuGroup(entry) {
  return (
    typeof entry === "object" &&
    entry !== null &&
    !entry.route &&
    (entry.type === MENU_GROUP_TYPE || getMenuGroupChildren(entry) !== undefined)
  );
}

// Walks groups to collect the leaves only (route-bearing entries).
export function flattenMenuLeaves(entries) {
  return ensureArray(entries).reduce(
    (leaves, entry) => leaves.concat(isMenuGroup(entry) ? flattenMenuLeaves(getMenuGroupChildren(entry)) : [entry]),
    [],
  );
}

function matchesRights(entryRights, rightsSet) {
  return !entryRights || ensureArray(entryRights).some((er) => rightsSet.has(String(er)));
}

// Prepares a menu level. Groups are kept as { type, entries } nodes and may be
// nested at any depth; their children are filtered/prepared recursively.
function prepareMenuLevel(rightsSet, intl, entries, routes) {
  const prepared = [];

  ensureArray(entries).forEach((entry) => {
    if (isMenuGroup(entry)) {
      const children = prepareMenuLevel(rightsSet, intl, getMenuGroupChildren(entry), routes);
      if (!children.length) return;
      if (!matchesRights(entry.rights, rightsSet)) return;
      // Unlike leaves, a group without icon must not fall back to the default
      // icon (nor warn), so only declared icons are resolved.
      const iconRef = GetIconFromId(entry.icon, routes, entry.id);
      const group = {
        ...entry,
        type: MENU_GROUP_TYPE,
        icon: iconRef ? GetIconComponent(iconRef) : undefined,
        text: getMenuText(GetTextFromId(entry.text, routes, entry.id), intl),
        entries: children,
      };
      // Normalise to the canonical shape: the alias is an input-only concern.
      delete group.children;
      prepared.push(group);
      return;
    }

    const routeRef = entry.route || entry.id;
    if (routeRef === undefined) return;
    if (!matchesRights(GetRightsFromId(entry.rights, routes, routeRef), rightsSet)) return;
    prepared.push({
      ...entry,
      icon: GetIconComponent(GetIconFromId(entry.icon, routes, routeRef)),
      text: getMenuText(GetTextFromId(entry.text, routes, routeRef), intl),
      route: "/" + GetRouteFromId(entry.route, routes, entry.id),
    });
  });

  // Sort by position (default 99 if missing; stable for duplicates)
  prepared.sort((a, b) => (a.position || 99) - (b.position || 99));

  return prepared;
}

// Turns the prepared entries into a flat render list: a titled separator opens
// each group and a plain separator closes it, unless the group is last or
// immediately followed by another group. Nested groups are expanded the same
// way, so a group is never emitted as a routeless leaf. Kept for backward
// compatibility of the public API: MainMenuContribution renders groups as
// submenus.
export function buildMenuItems(entries, keyPrefix = "") {
  const items = [];
  const list = ensureArray(entries);

  list.forEach((entry, idx) => {
    // index-suffixed so duplicated ids cannot collide as React keys
    const key = `${keyPrefix}${entry.id || entry.route || "item"}_${idx}`;
    if (!isMenuGroup(entry)) {
      items.push({ kind: "entry", entry, key });
      return;
    }
    items.push({ kind: "groupHeader", text: entry.text, key: `${key}_groupHeader` });
    items.push(...buildMenuItems(getMenuGroupChildren(entry), `${key}_`));

    const next = list[idx + 1];
    if (next && !isMenuGroup(next)) {
      items.push({ kind: "groupFooter", key: `${key}_groupFooter` });
    }
  });

  return items;
}

export function prepareMenuEntries(rights, intl, entries, routes) {
  const rightsSet = new Set(ensureArray(rights).map((r) => String(r)));
  return prepareMenuLevel(rightsSet, intl, entries, routes);
}

export const prepareForComparison = (stateRole, propsRole, roleRights) => {
  const tempStateRole = { ...stateRole };
  delete tempStateRole.roleRights;

  const tempPropsRole = { ...propsRole, isSystem: !!propsRole?.isSystem };

  const tempRoleRights = roleRights?.map((right) => right?.rightId);

  return {
    stateRole: tempStateRole,
    propsRole: tempPropsRole,
    convertedRoleRights: tempRoleRights || [],
  };
};

export function getTimeDifferenceInDays(_firstDate, _secondDate) {
  let firstDate = new Date(_firstDate);
  let secondDate = new Date(_secondDate);
  const timeDelta = firstDate.getTime() - secondDate.getTime();
  const timeInDays = Math.ceil(timeDelta / (1000 * 60 * 60 * 24));

  return timeInDays;
}

export function getTimeDifferenceInDaysFromToday(dateToCheck) {
  const currentDate = new Date();
  return getTimeDifferenceInDays(dateToCheck, currentDate);
}

export const getPublicUrl = () => {
  const publicUrl = process.env.PUBLIC_URL || "";
  if (!publicUrl || publicUrl === "/") {
    return "";
  }
  return publicUrl.startsWith("/") ? publicUrl : `/${publicUrl}`;
};

const UNAUTHENTICATED_ROUTES = ["login", "forgot_password", "set_password", "logout"];

export const isUnauthenticatedRoute = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const publicUrl = getPublicUrl();
  const { pathname } = window.location;

  return UNAUTHENTICATED_ROUTES.some((route) => {
    const fullPath = `${publicUrl}/${route}`.replace(/\/{2,}/g, "/");
    return pathname === fullPath || pathname.endsWith(`/${route}`);
  });
};

export const redirectToLogin = async () => {
  await clearExpiredSession();

  if (isUnauthenticatedRoute()) {
    return;
  }

  const publicUrl = getPublicUrl();
  const loginPath = `${publicUrl}/login`.replace(/\/{2,}/g, "/");
  window.location.replace(loginPath);
};

export const handleBootLogout = () => {
  const publicUrl = getPublicUrl();
  const logoutPath = `${publicUrl}/logout`.replace(/\/{2,}/g, "/") || "/logout";
  const { pathname } = window.location;

  if (pathname === logoutPath || pathname.endsWith("/logout")) {
    redirectToLogin();
    return true;
  }

  return false;
};

export const onLogout = async (dispatch) => {
  clearLocalStorage();
  await dispatch(logout());
};

export const redirectToSamlLogout = (e) => {
  e.preventDefault();
  clearLocalStorage();
  const redirectToURL = new URL(`${window.location.origin}${baseApiUrl}${SAML_LOGOUT_PATH}`);

  window.location.href = redirectToURL.href;
};

export const getLanguageNameByCode = (languages, languageCode) => {
  return languages.find((language) => language.code === languageCode)?.name;
};

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export function getDecimalPlaces(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;

  const str = typeof value === "string" && value.includes(".") ? value.trim() : String(Number(value));
  if (!str.includes(".")) return 0;
  return str.split(".")[1]?.length || 0;
}

export function parseLocalizedNumber(raw, locale = "en") {
  if (raw == null || raw === "") return NaN;

  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
  const groupSeparator = parts.find((part) => part.type === "group")?.value ?? "";
  const decimalSeparator = parts.find((part) => part.type === "decimal")?.value ?? ".";

  let normalized = String(raw).replace(/\s/g, "");
  if (groupSeparator) {
    normalized = normalized.split(groupSeparator).join("");
  }
  if (decimalSeparator !== ".") {
    const lastDecimalIndex = normalized.lastIndexOf(decimalSeparator);
    if (lastDecimalIndex !== -1) {
      normalized =
        normalized.slice(0, lastDecimalIndex) + "." + normalized.slice(lastDecimalIndex + decimalSeparator.length);
    }
  }
  return parseFloat(normalized);
}

export function menuEntryMatchesLocationPath(entry, routes = null) {
  if (typeof entry !== "object" || entry === null) return false;
  const pathname = typeof window !== "undefined" && window.location ? window.location.pathname : "";
  let route = entry.route;
  if (!route && routes && entry.id) {
    route = GetRouteFromId(null, routes, entry.id);
  }
  if (!route) return false;
  if (!route.startsWith("/")) {
    route = "/" + route;
  }
  const publicUrl = getPublicUrl();
  const effective = `${publicUrl}${route}`.replace(/\/{2,}/g, "/");
  const pathOnly = pathname.split(/[?#]/)[0];
  return pathOnly === effective || pathOnly.startsWith(effective + "/");
}
