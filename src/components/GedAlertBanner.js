import React from "react";
import { useGedHealthCheck } from "../helpers/hooks/useGedHealthCheck";

export default function GedAlertBanner() {
  const { isGedDown, isChecking } = useGedHealthCheck();

  if (!isGedDown) return <></>;

  return (
    <div
      style={{
        backgroundColor: "#ffcccc",
        color: "#900",
        textAlign: "center",
        padding: "12px 0",
        fontWeight: "bold",
        fontSize: "14px",
        width: "100%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {`⚠️ Service GED (DMS) est actuellement indisponible. Veuillez contacter l'équipe technique.`}
    </div>
  );
}
