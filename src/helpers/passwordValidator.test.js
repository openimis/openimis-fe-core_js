import { beforeEach, describe, expect, it, vi } from "vitest";

const zxcvbn = vi.fn();
vi.mock("zxcvbn", () => ({ default: (...args) => zxcvbn(...args) }));

const { addSuggestion, generateFeedback, validatePassword } = await import("./passwordValidator");

const formatMessage = (id) => id;
const formatMessageWithValues = (id, values) => `${id}(${JSON.stringify(values)})`;

const policy = (overrides = {}) =>
  JSON.stringify({
    min_length: 8,
    require_lower_case: 1,
    require_upper_case: 1,
    require_numbers: 1,
    require_special_characters: 1,
    ...overrides,
  });

const scoring = (score, suggestions = []) => zxcvbn.mockReturnValue({ score, feedback: { suggestions } });

beforeEach(() => scoring(4));

describe("addSuggestion", () => {
  it("appends only when the condition holds", () => {
    const suggestions = [];
    addSuggestion(suggestions, true, "a");
    addSuggestion(suggestions, false, "b");

    expect(suggestions).toEqual(["a"]);
  });
});

describe("generateFeedback", () => {
  it("joins suggestions into a requirements message and forces score 0", () => {
    expect(generateFeedback(["a", "b"], formatMessageWithValues)).toEqual({
      feedback: 'admin.password.requirements({"requirements":"a, b"})',
      score: 0,
    });
  });

  it("returns null when there is nothing to complain about", () => {
    expect(generateFeedback([], formatMessageWithValues)).toBeNull();
  });
});

describe("validatePassword", () => {
  it("returns a neutral result when there is no policy or no password", () => {
    expect(validatePassword("", policy(), formatMessage, formatMessageWithValues)).toEqual({ feedback: "", score: 0 });
    expect(validatePassword("abc", null, formatMessage, formatMessageWithValues)).toEqual({ feedback: "", score: 0 });
  });

  it("does not consult zxcvbn while the policy is unmet", () => {
    validatePassword("short", policy(), formatMessage, formatMessageWithValues);

    expect(zxcvbn).not.toHaveBeenCalled();
  });

  it.each([
    ["min length", "Aa1!", /minLength/],
    ["lower case", "AAAA1111!", /lowerCase/],
    ["upper case", "aaaa1111!", /upperCase/],
    ["digits", "aaaaAAAA!", /numbers/],
    ["special characters", "aaaaAAAA1", /specialCharacters/],
  ])("reports a violated %s requirement", (_label, password, expected) => {
    const result = validatePassword(password, policy(), formatMessage, formatMessageWithValues);

    expect(result.score).toBe(0);
    expect(result.feedback).toMatch(expected);
  });

  it("collects every violated requirement in one message", () => {
    const result = validatePassword("a", policy(), formatMessage, formatMessageWithValues);

    expect(result.feedback).toMatch(/minLength/);
    expect(result.feedback).toMatch(/upperCase/);
    expect(result.feedback).toMatch(/numbers/);
    expect(result.feedback).toMatch(/specialCharacters/);
  });

  it("skips a requirement the policy does not ask for", () => {
    const relaxed = policy({ require_special_characters: 0, require_numbers: 0 });

    expect(validatePassword("aaaaAAAA", relaxed, formatMessage, formatMessageWithValues).score).toBe(4);
  });

  it.each([
    [1, "admin.password.weak"],
    [2, "admin.password.medium"],
    [3, "admin.password.strong"],
    [4, "admin.password.veryStrong"],
  ])("maps a zxcvbn score of %i onto its label", (score, expected) => {
    scoring(score);

    const result = validatePassword("aaaaAAAA1!", policy(), formatMessage, formatMessageWithValues);

    expect(result.score).toBe(score);
    expect(result.feedback).toContain(expected);
  });

  it("appends zxcvbn's own suggestions to the weaker scores", () => {
    scoring(1, ["Add another word"]);

    expect(validatePassword("aaaaAAAA1!", policy(), formatMessage, formatMessageWithValues).feedback).toBe(
      "admin.password.weak. Add another word",
    );
  });

  // Currently fails: the switch handles 1-4 and lets 0 - the weakest score -
  // fall through to the "unknown score" branch.
  it.fails("labels the weakest zxcvbn score rather than calling it unknown", () => {
    scoring(0);

    expect(validatePassword("aaaaAAAA1!", policy(), formatMessage, formatMessageWithValues).feedback).not.toContain(
      "unknownScore",
    );
  });

  // Currently fails: the policy is JSON.parsed without a guard, so a malformed
  // value from the server takes down the caller instead of degrading.
  it.fails("survives a malformed password policy", () => {
    expect(() => validatePassword("aaaaAAAA1!", "not json", formatMessage, formatMessageWithValues)).not.toThrow();
  });
});
