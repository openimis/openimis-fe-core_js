import React, { useLayoutEffect, useRef } from "react";
import { createBrowserHistory } from "history";
import { Router } from "react-router";

export function BrowserRouter({ basename, children, history }) {
  let historyRef = useRef(history);
  if (!historyRef.current) {
    historyRef.current = createBrowserHistory({ window });
  }

  let currentHistory = historyRef.current;
  let [state, setState] = React.useState({
    action: currentHistory.action,
    location: currentHistory.location,
  });

  useLayoutEffect(() => currentHistory.listen(setState), [currentHistory]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={currentHistory}
    />
  );
}

export default BrowserRouter;
