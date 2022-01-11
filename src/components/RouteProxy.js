import { useParams } from "react-router-dom";
import React, { useMemo } from "react";
import { useModulesManager } from "../helpers/modules";

const makeDeprecated = (obj, message) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.warn(`[Deprecated]: ${message}`);

      // @ts-ignore
      return Reflect.get(...arguments);
    },
  });
};

const RouteProxy = ({ RouteComponent, ...props }) => {
  const params = useParams();
  const modulesManager = useModulesManager();
  const match = useMemo(
    () => ({
      params: makeDeprecated(
        params,
        "Import `useMatch` & `useParams` from 'react-router-dom' instead of using the params provided by the page.",
      ),
    }),
    [params],
  );

  const proxyModulesManager = useMemo(
    () =>
      makeDeprecated(
        modulesManager,
        "Import & use `useModulesManager` from '@openimis/fe-core' instead of using the one provided by the page",
      ),
    [modulesManager],
  );

  return <RouteComponent {...props} match={match} modulesManager={proxyModulesManager} />;
};

export default RouteProxy;
