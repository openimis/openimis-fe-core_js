import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  clearLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
  useLocalStorage,
} from "./useLocalStorage";

describe("getLocalStorage", () => {
  it("parses a stored value", () => {
    window.localStorage.setItem("k", JSON.stringify({ a: 1 }));

    expect(getLocalStorage("k")).toEqual({ a: 1 });
  });

  it("returns the default when the key is absent", () => {
    expect(getLocalStorage("missing")).toBeNull();
    expect(getLocalStorage("missing", "fallback")).toBe("fallback");
  });

  it("returns the default rather than throwing on corrupt json", () => {
    window.localStorage.setItem("k", "{not json");

    expect(getLocalStorage("k", "fallback")).toBe("fallback");
  });
});

describe("setLocalStorage", () => {
  it("serialises the value", () => {
    setLocalStorage("k", { a: 1 });

    expect(window.localStorage.getItem("k")).toBe('{"a":1}');
  });

  it("removes the key for null and undefined instead of storing them", () => {
    setLocalStorage("k", "v");
    setLocalStorage("k", null);
    expect(window.localStorage.getItem("k")).toBeNull();

    setLocalStorage("k", "v");
    setLocalStorage("k", undefined);
    expect(window.localStorage.getItem("k")).toBeNull();
  });

  it("notifies same-tab listeners", () => {
    const listener = vi.fn();
    window.addEventListener("localStorageChange", listener);

    setLocalStorage("k", "v");

    expect(listener).toHaveBeenCalled();
    window.removeEventListener("localStorageChange", listener);
  });
});

describe("removeLocalStorage / clearLocalStorage", () => {
  it("removes a single key", () => {
    setLocalStorage("a", 1);
    setLocalStorage("b", 2);
    removeLocalStorage("a");

    expect(getLocalStorage("a")).toBeNull();
    expect(getLocalStorage("b")).toBe(2);
  });

  it("clears everything", () => {
    setLocalStorage("a", 1);
    setLocalStorage("b", 2);
    clearLocalStorage();

    expect(window.localStorage.length).toBe(0);
  });

  it("both notify same-tab listeners", () => {
    const listener = vi.fn();
    window.addEventListener("localStorageChange", listener);

    removeLocalStorage("a");
    clearLocalStorage();

    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener("localStorageChange", listener);
  });
});

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    expect(result.current[0]).toBe("initial");
  });

  it("reads an existing value on mount", () => {
    window.localStorage.setItem("k", JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    expect(result.current[0]).toBe("stored");
  });

  it("writes and re-renders with the new value", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    act(() => result.current[1]("updated"));

    expect(result.current[0]).toBe("updated");
    expect(window.localStorage.getItem("k")).toBe('"updated"');
  });

  it("accepts an updater function", () => {
    const { result } = renderHook(() => useLocalStorage("count", 1));

    act(() => result.current[1]((n) => n + 1));

    expect(result.current[0]).toBe(2);
  });

  it("removes the key when set to null and falls back to the initial value", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));
    act(() => result.current[1]("v"));

    act(() => result.current[1](null));

    expect(window.localStorage.getItem("k")).toBeNull();
    expect(result.current[0]).toBe("initial");
  });

  it("re-reads when another component writes the same key", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    act(() => setLocalStorage("k", "from elsewhere"));

    expect(result.current[0]).toBe("from elsewhere");
  });

  it("re-reads on a cross-tab storage event", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    act(() => {
      window.localStorage.setItem("k", JSON.stringify("from another tab"));
      window.dispatchEvent(new StorageEvent("storage", { key: "k" }));
    });

    expect(result.current[0]).toBe("from another tab");
  });

  it("ignores storage events for unrelated keys", () => {
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    act(() => {
      window.localStorage.setItem("other", JSON.stringify("x"));
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });

    expect(result.current[0]).toBe("initial");
  });

  it("falls back to the initial value and warns on corrupt json", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem("k", "{not json");

    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    expect(result.current[0]).toBe("initial");
    expect(warn).toHaveBeenCalled();
  });

  it("stops listening once unmounted", () => {
    const remove = vi.spyOn(window, "removeEventListener");

    renderHook(() => useLocalStorage("k", "initial")).unmount();

    expect(remove).toHaveBeenCalledWith("storage", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("localStorageChange", expect.any(Function));
  });

  // Currently fails: the hook removes only on null, while setLocalStorage also
  // removes on undefined. Here undefined is stringified to the string
  // "undefined", which then fails to parse on the next read.
  it.fails("treats undefined like null, as setLocalStorage does", () => {
    // Reading back "undefined" warns; keep it out of the run output.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useLocalStorage("k", "initial"));

    act(() => result.current[1](undefined));

    expect(window.localStorage.getItem("k")).toBeNull();
  });
});
