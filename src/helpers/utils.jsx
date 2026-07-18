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

export function prepareMenuEntries(rights, intl, entries, routes) {
  const rightsSet = new Set(rights.map((r) => String(r)));

  // Filter entries by rights and convert icon strings to components
  const filteredEntries = entries
    .filter((entry) => {
      const routeRef = entry.route || entry.id;
      const entryRights = GetRightsFromId(entry.rights, routes, routeRef);
      return routeRef !== undefined && (!entryRights || entryRights.some((er) => rightsSet.has(String(er))));
    })
    .map((entry) => ({
      ...entry,
      icon: GetIconComponent(GetIconFromId(entry.icon, routes, entry.route || entry.id)),
      text: getMenuText(GetTextFromId(entry.text, routes, entry.route || entry.id), intl),
      route: "/" + GetRouteFromId(entry.route, routes, entry.id),
    }));

  // Sort by position (default 99 if missing; stable for duplicates)
  filteredEntries.sort((a, b) => (a.position || 99) - (b.position || 99));

  return filteredEntries;
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
