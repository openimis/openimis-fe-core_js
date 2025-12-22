import { baseApiUrl, apiHeaders, Contributions } from "@openimis/fe-core";
import { useCallback, useEffect, useRef, useState } from "react";
import cookie from "cookie_js";

const API_URL = `${baseApiUrl}/insuree/ged-health-check/`;
export const useGedHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({
    isGedDown: false,
    isChecking: false,
  });

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        setHealthStatus((prev) => ({ ...prev, isChecking: true }));

        const response = await fetch(API_URL, {
          headers: apiHeaders,
          method: "GET",
          credentials: "same-origin",
        });

        if (response.status != 200) {
          throw new Error(`Failed to fetch GED health status: ${response.statusText}`);
        }

        const payload = await response.json();

        setHealthStatus((prev) => ({
          ...prev,
          isChecking: false,
          isGedDown: payload.status !== 200,
        }));

        // sessionStorage.setItem("gedHealthStatus", payload.status === 200 ? "UP" : "DOWN");
        cookie.set("gedHealthStatus", payload.status === 200 ? "UP" : "DOWN", { expires: 5 / 1440 });
      } catch (err) {
        console.error("Error fetching GED health status:", err);
        setHealthStatus((prev) => ({
          ...prev,
          isChecking: false,
          isGedDown: true,
        }));
      }
    };

    // const storedStatus = sessionStorage.getItem("gedHealthStatus") || false;
    const storedStatus = cookie.get("gedHealthStatus") || false;

    if (!storedStatus) {
      fetchHealthStatus();
    } else {
      setHealthStatus((prev) => ({
        ...prev,
        isChecking: false,
        isGedDown: storedStatus !== "UP",
      }));
    }
  }, []);

  return { ...healthStatus };
};
