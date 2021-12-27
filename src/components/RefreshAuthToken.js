import { useRef, useEffect } from "react";
import { useAuthentication } from "../helpers/hooks";

const RefreshAuthToken = () => {
  const auth = useAuthentication();
  const timeoutRef = useRef();

  useEffect(() => {
    if (auth.refreshToken && auth.isAuthenticated) {
      timeoutRef.current = setTimeout(auth.refresh, 5 * 60 * 1000); // Refresh the token every 5 minutes
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [auth.refreshToken, auth.isAuthenticated]);

  return null;
};

export default RefreshAuthToken;
