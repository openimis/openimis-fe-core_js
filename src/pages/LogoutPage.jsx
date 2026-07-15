import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useHistory } from "../helpers/history";
import { useModulesManager } from "../helpers/modules";
import { onLogout, redirectToSamlLogout } from "../helpers/utils";

const LogoutPage = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  useEffect(() => {
    const performLogout = async () => {
      const mPassLogout = modulesManager.getConf("fe-core", "LogoutButton.showMPassProvider", false);
      if (mPassLogout) {
        redirectToSamlLogout();
      } else {
        await onLogout(dispatch);
        history.push("/");
      }
    };
    performLogout();
  }, [dispatch, history, modulesManager]);

  return null;
};

export default LogoutPage;
