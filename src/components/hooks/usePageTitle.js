import React from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { routePages } from "../hooks/routes";

const compareRoutesByLength = (firstRoute, secondRoute) => {
  const firstRoutePath = firstRoute.path || "";
  const secondRoutePath = secondRoute.path || "";
  return secondRoutePath.length - firstRoutePath.length;
};

const isExactMatch = (routePath, currentPathname) => {
  return routePath === currentPathname;
};

const isParameterizedMatch = (routePath, currentPathname) => {
  const pathPattern = routePath.replace(/:[^/]+/g, "[^/]+");
  const regex = new RegExp(`^${pathPattern}(/.*)?$`);
  return regex.test(currentPathname);
};

const isPrefixMatch = (routePath, currentPathname, allRoutes) => {
  if (!currentPathname.startsWith(routePath) || routePath === "/") {
    return false;
  }

  const hasMoreSpecificMatch = allRoutes.some((otherRoute) => {
    const otherRoutePath = otherRoute.path;
    if (!otherRoutePath || otherRoutePath === routePath) {
      return false;
    }

    if (otherRoutePath.length > routePath.length && currentPathname.startsWith(otherRoutePath)) {
      const nextChar = currentPathname[otherRoutePath.length];
      if (nextChar === "/" || nextChar === undefined) {
        return true;
      }
    }
    return false;
  });

  if (hasMoreSpecificMatch) {
    return false;
  }

  const nextChar = currentPathname[routePath.length];
  return nextChar === "/" || nextChar === undefined;
};

const doesRouteMatch = (route, currentPathname, allRoutes) => {
  const routePath = route.path;
  if (!routePath) {
    return false;
  }

  return (
    isExactMatch(routePath, currentPathname) ||
    isParameterizedMatch(routePath, currentPathname) ||
    isPrefixMatch(routePath, currentPathname, allRoutes)
  );
};

const findMatchingRoute = (routes, currentPathname) => {
  const sortedRoutes = [...routes].sort(compareRoutesByLength);
  return sortedRoutes.find((route) => doesRouteMatch(route, currentPathname, sortedRoutes)) || null;
};

function UsePageTitle() {
  const location = useLocation();
  const { pathname } = location;
  const intl = useIntl();
  const [page, setPage] = React.useState({ path: pathname });

  React.useEffect(() => {
    const matchedRoute = findMatchingRoute(routePages, pathname);

    if (matchedRoute) {
      const translateKey = (key) => {
        if (!key) return key;
        try {
          const translated = intl.formatMessage({ id: key });
          return translated !== key ? translated : key;
        } catch {
          return key;
        }
      };

      const translatedRoute = {
        ...matchedRoute,
        path: pathname,
        parent: translateKey(matchedRoute.parent),
        title: translateKey(matchedRoute.title),
        subtitle: translateKey(matchedRoute.subtitle),
      };
      setPage((previousPage) => translatedRoute);
    } else {
      setPage({ path: pathname });
    }
  }, [pathname, intl]);

  return page;
}

export default UsePageTitle;
