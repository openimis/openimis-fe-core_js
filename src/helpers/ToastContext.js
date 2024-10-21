import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import { Typography, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

const CONFIG = {
  AUTOHIDE_DURATION: 5000,
  ANCHOR_ORIGIN: { vertical: "bottom", horizontal: "left" },
  SEVERITY_LEVELS: {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  },
};

function Alert(props) {
  return <MuiAlert elevation={4} variant="filled" {...props} />;
}

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState(CONFIG.SEVERITY_LEVELS.INFO);

  const showToast = useCallback((message, severity) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  }, []);

  const hideToast = useCallback(() => {
    setOpen(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      showSuccess: (message) => showToast(message, CONFIG.SEVERITY_LEVELS.SUCCESS),
      showError: (message) => showToast(message, CONFIG.SEVERITY_LEVELS.ERROR),
      showWarning: (message) => showToast(message, CONFIG.SEVERITY_LEVELS.WARNING),
      showInfo: (message) => showToast(message, CONFIG.SEVERITY_LEVELS.INFO),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={open}
        anchorOrigin={CONFIG.ANCHOR_ORIGIN}
        autoHideDuration={CONFIG.AUTOHIDE_DURATION}
        onClose={hideToast}
      >
        <Alert onClose={hideToast} severity={severity} style={{ maxWidth: 500, minWidth: 300 }}>
          <Typography variant="body1"> {message} </Typography>
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
