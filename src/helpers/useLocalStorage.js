import { useSyncExternalStore } from "react";

export function useLocalStorage(key, initialValue) {
  const subscribe = (callback) => {
    const handleStorageChange = (event) => {
      if (event.key === key || event.key === null) {
        // null for clear()
        callback();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for same-window changes
    const handleLocalChange = () => callback();
    window.addEventListener("localStorageChange", handleLocalChange); // custom event for same tab

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleLocalChange);
    };
  };

  const getSnapshot = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  const getServerSnapshot = () => initialValue;

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = (value) => {
    try {
      const newValue = typeof value === "function" ? value(storedValue) : value;
      if (newValue === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      // Dispatch custom event for same tab sync
      window.dispatchEvent(new Event("localStorageChange"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}

// Utility for non-React code (SSR-safe)
export const getLocalStorage = (key, defaultValue = null) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// SSR-safe
export const setLocalStorage = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    window.dispatchEvent(new Event("localStorageChange"));
  } catch (e) {
    console.warn(`Could not save to localStorage key ${key}`, e);
  }
};

// SSR-safe
export const removeLocalStorage = (key) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new Event("localStorageChange"));
  } catch (e) {}
};

// SSR-safe
export const clearLocalStorage = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.clear();
    window.dispatchEvent(new Event("localStorageChange"));
  } catch (e) {
    console.warn("Could not clear localStorage", e);
  }
};
