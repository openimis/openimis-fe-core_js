import { apiHeaders, baseApiUrl } from "@openimis/fe-core";
import cookie from "cookie_js";
import { useEffect, useState } from "react";

const API_URL = `${baseApiUrl}/policyholder/odoo-health-check/`;

export const useOdooHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({
    isOdooDown: false,
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

        if (!response.ok && response.status !== 503) {
          throw new Error(`Failed to fetch Odoo health status: ${response.statusText}`);
        }

        setHealthStatus((prev) => ({
          ...prev,
          isChecking: false,
          isOdooDown: response.status === 503,
        }));

        cookie.set("odooHealthStatus", response.status === 503 ? "DOWN" : "UP", { expires: 5 / 1440 });
      } catch (err) {
        console.error("Error fetching Odoo health status:", err);
        setHealthStatus((prev) => ({
          ...prev,
          isChecking: false,
          isOdooDown: true,
        }));
      }
    };

    const storedStatus = cookie.get("odooHealthStatus") || false;

    if (!storedStatus) {
      fetchHealthStatus();
    } else {
      setHealthStatus((prev) => ({
        ...prev,
        isChecking: false,
        isOdooDown: storedStatus !== "UP",
      }));
    }
  }, []);

  return { ...healthStatus };
};
