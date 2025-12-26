import React from "react";
import { useOdooHealthCheck } from "../helpers/hooks/useOdooHealthCheck";

export default function OdooAlertBanner() {
  const { isOdooDown, isChecking } = useOdooHealthCheck();

  if (isChecking || !isOdooDown) return null;

  return (
    <div
      style={{
        backgroundColor: "#fff3cd",
        color: "#856404",
        textAlign: "center",
        padding: "12px 0",
        fontWeight: "bold",
        fontSize: "14px",
        width: "100%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      ⚠️ Le service Odoo est actuellement indisponible.
    </div>
  );
}
