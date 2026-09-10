import { beforeEach, describe, expect, it } from "vitest";

import { deleteCookie, getCookie, setCookie } from "./cookies";

const clearAll = () =>
  document.cookie.split("; ").forEach((c) => {
    const name = c.split("=")[0];
    if (name) document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; path=/`;
  });

beforeEach(clearAll);

describe("cookies", () => {
  it("round-trips a value", () => {
    setCookie("token", "abc123");

    expect(getCookie("token")).toBe("abc123");
  });

  it("returns null for a cookie that was never set", () => {
    expect(getCookie("absent")).toBeNull();
  });

  it("keeps cookies independent", () => {
    setCookie("a", "1");
    setCookie("b", "2");

    expect(getCookie("a")).toBe("1");
    expect(getCookie("b")).toBe("2");
  });

  it("survives values containing separators", () => {
    setCookie("payload", "a=b; c,d");

    expect(getCookie("payload")).toBe("a=b; c,d");
  });

  it("survives non-ascii values", () => {
    setCookie("name", "Zoë Ünïcode");

    expect(getCookie("name")).toBe("Zoë Ünïcode");
  });

  it("overwrites an existing cookie rather than duplicating it", () => {
    setCookie("token", "first");
    setCookie("token", "second");

    expect(getCookie("token")).toBe("second");
  });

  it("deletes a cookie", () => {
    setCookie("token", "abc");
    deleteCookie("token");

    expect(getCookie("token")).toBeNull();
  });

  it("tolerates deleting something that is not there", () => {
    expect(() => deleteCookie("absent")).not.toThrow();
    expect(getCookie("absent")).toBeNull();
  });
});
