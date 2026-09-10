import { describe, expect, it } from "vitest";

import { passwordGenerator } from "./passwordGenerator";

const SPECIAL = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/;
const times = (n, fn) => Array.from({ length: n }, fn);

describe("passwordGenerator", () => {
  it("defaults to 10 characters", () => {
    expect(passwordGenerator()).toHaveLength(10);
  });

  it("honours the requested length", () => {
    expect(passwordGenerator({ length: 24 })).toHaveLength(24);
    expect(passwordGenerator({ length: 1 })).toHaveLength(1);
  });

  it("returns an empty string for zero length", () => {
    expect(passwordGenerator({ length: 0 })).toBe("");
  });

  it("draws only from the enabled character sets", () => {
    const passwords = times(50, () =>
      passwordGenerator({
        length: 20,
        isUpperCaseRequired: false,
        isNumberRequired: false,
        isSpecialSymbolRequired: false,
      }),
    );

    expect(passwords.every((p) => /^[a-z]+$/.test(p))).toBe(true);
  });

  it("mixes sets when several are enabled", () => {
    // Not asserted per-password: with the current implementation any single
    // password may miss a set (see the pinned test below).
    const joined = times(50, () => passwordGenerator({ length: 20 })).join("");

    expect(joined).toMatch(/[a-z]/);
    expect(joined).toMatch(/[A-Z]/);
    expect(joined).toMatch(/\d/);
    expect(joined).toMatch(SPECIAL);
  });

  it("does not repeat itself", () => {
    const passwords = times(20, () => passwordGenerator({ length: 16 }));

    expect(new Set(passwords).size).toBe(passwords.length);
  });

  // Currently fails: each position picks a random category, so nothing
  // guarantees a required category actually appears. At length 10 with four
  // sets enabled, ~5.7% of passwords contain no digit.
  it.fails("always includes a character from every required set", () => {
    const passwords = times(300, () => passwordGenerator({ length: 10 }));

    const missing = passwords.filter((p) => !/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p) || !SPECIAL.test(p));

    expect(missing).toEqual([]);
  });
});
