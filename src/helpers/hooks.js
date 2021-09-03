import { useState, useEffect, useRef } from "react";

export const useDebounceCb = (cb, duration = 0) => {
  const [payload, setPayload] = useState();
  const [enabled, setEnabled] = useState(false);
  const timeoutRef = useRef();
  useEffect(() => {
    if (enabled) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => cb(...payload), duration);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [payload]);

  return (...args) => {
    setEnabled(true);
    setPayload(args);
  };
};
