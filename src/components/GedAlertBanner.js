import React from "react";
import { useGedHealthCheck} from "../helpers/hooks";

export default function GedAlertBanner() {
  const { isGedDown, isChecking } = useGedHealthCheck();

  if (!isGedDown) return <></>;

  return (
    <>
      <div
        style={{
          backgroundColor: "#ffcccc",
          color: "#900",
          textAlign: "center",
          padding: "12px 0",
          fontWeight: "bold",
          fontSize: "14px",
          marginTop: "20px",
          width: "100%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          //   position: "fixed",
          //   top: "80px",
          //   left: 0,
          //   right: 0,
          //   zIndex: 1200,
        }}
      >
        {`⚠️ Service GED (DMS) est actuellement indisponible. Veuillez contacter l'équipe technique.`}
      </div>

      <div
        style={{
          height: "48px",
          width: "100%",
        }}
      />
    </>
  );
}
