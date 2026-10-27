import { describe, expect, it } from "vitest";

import { passwordGenerator } from "./passwordGenerator";

const SPECIAL = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/;
// The "symbols" class of the backend password_validator library (constants.py),
// which be-core's CustomPasswordValidator applies when PASSWORD_SYMBOLS > 0:
//   r'[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\\|;\:\'",<.>\/\?\€\£\¥\₹]+'
const BACKEND_SYMBOL = /[`~!@#$%^&*()\-_=+[{}\]\\|;:'",<.>/?€£¥₹]/;
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
    // Per-password coverage is asserted separately below.
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

  it("always includes a character from every required set", () => {
    const passwords = times(300, () => passwordGenerator({ length: 10 }));

    const missing = passwords.filter((p) => !/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p) || !SPECIAL.test(p));

    expect(missing).toEqual([]);
  });

  it("satisfies every character class the backend password validator requires", () => {
    // Options used by UserMasterPanel when fe-admin.passwordGeneratorOptions is not configured.
    const passwords = times(1000, () => passwordGenerator({ length: 12 }));

    const rejected = passwords.filter(
      (p) => !/[A-Z]/.test(p) || !/[a-z]/.test(p) || !/\d/.test(p) || !BACKEND_SYMBOL.test(p),
    );

    expect(rejected).toEqual([]);
  });

  it("only uses the enabled sets and still covers each of them", () => {
    const passwords = times(200, () =>
      passwordGenerator({ length: 3, isLowerCaseRequired: false, isSpecialSymbolRequired: false }),
    );

    expect(passwords.every((p) => /^[A-Z0-9]{3}$/.test(p) && /[A-Z]/.test(p) && /\d/.test(p))).toBe(true);
  });

  it("uses distinct required sets when shorter than the number of sets", () => {
    const passwords = times(200, () => passwordGenerator({ length: 2 }));
    const classOf = (c) => (/[a-z]/.test(c) ? "lower" : /[A-Z]/.test(c) ? "upper" : /\d/.test(c) ? "digit" : "symbol");

    expect(passwords.every((p) => p.length === 2 && classOf(p[0]) !== classOf(p[1]))).toBe(true);
  });
});
