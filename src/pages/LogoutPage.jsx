import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { coreAlert } from "../actions";
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
        const succeeded = await onLogout(dispatch);
        if (!succeeded) {
          // The local state is cleared regardless, so the app looks signed out
          // while the server-side session may well still be open. Say so rather
          // than let the user walk away from a live session.
          dispatch(
            coreAlert(
              "Logout incomplete",
              "You have been signed out of this browser, but the server could not confirm it. " +
                "If you are on a shared device, close the browser and tell your administrator.",
            ),
          );
        }
        history.push("/");
      }
    };
    performLogout();
  }, [dispatch, history, modulesManager]);

  return null;
};

export default LogoutPage;
