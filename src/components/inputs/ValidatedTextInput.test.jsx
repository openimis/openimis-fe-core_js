import React, { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { default: ValidatedTextInput } = await import("./ValidatedTextInput");
const { renderWithProviders, screen, waitFor, userEvent } = await import("../../testing");

const input = () => document.querySelector("input");

const messages = { "core.duplicate": "Name already used" };

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const renderField = ({ action, isValid, isValidating } = {}) => {
  const onChange = vi.fn();
  const check = action ?? vi.fn(() => ({ type: "TEST_VALIDATION_REQ" }));
  const Caller = () => {
    const [value, setValue] = useState("");
    return (
      <ValidatedTextInput
        itemQueryIdentifier="roleName"
        codeTakenLabel="duplicate"
        module="core"
        label="roleName"
        shouldValidate={() => true}
        isValid={isValid}
        isValidating={isValidating}
        action={check}
        clearAction={() => ({ type: "TEST_VALIDATION_CLEAR" })}
        setValidAction={() => ({ type: "TEST_VALIDATION_SET_VALID" })}
        value={value}
        onChange={(v) => {
          onChange(v);
          setValue(v);
        }}
      />
    );
  };
  renderWithProviders(<Caller />, { messages });
  return { action: check, onChange };
};

describe("ValidatedTextInput", () => {
  it("hands every keystroke to the caller without waiting for the check", async () => {
    const { onChange } = renderField();

    await userEvent.type(input(), "abcd");

    expect(onChange.mock.calls.map(([v]) => v)).toEqual(["a", "ab", "abc", "abcd"]);
    expect(input().value).toBe("abcd");
  });

  it("does not query while the user is still typing", async () => {
    const { action } = renderField();

    await userEvent.type(input(), "abcd");

    expect(action).not.toHaveBeenCalled();
  });

  it("queries once, for the final value, after the user stops typing", async () => {
    const { action } = renderField();

    await userEvent.type(input(), "abcd");
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 2000 });

    expect(action.mock.calls[0][1]).toEqual({ roleName: "abcd" });
  });

  it("passes additional query arguments along", async () => {
    const onChange = vi.fn();
    const action = vi.fn(() => ({ type: "TEST_VALIDATION_REQ" }));
    const Caller = () => {
      const [value, setValue] = useState("");
      return (
        <ValidatedTextInput
          itemQueryIdentifier="roleName"
          codeTakenLabel="duplicate"
          module="core"
          shouldValidate={() => true}
          action={action}
          clearAction={() => ({ type: "TEST_VALIDATION_CLEAR" })}
          additionalQueryArgs={{ uuid: "abc-123" }}
          value={value}
          onChange={setValue}
        />
      );
    };
    renderWithProviders(<Caller />, { messages });

    await userEvent.type(input(), "ab");
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 2000 });

    expect(action.mock.calls[0][1]).toEqual({ roleName: "ab", uuid: "abc-123" });
  });

  // The verdict in the store still describes the previous value while a new one is typed.
  it("shows a check in progress rather than the previous verdict", async () => {
    renderField({ isValid: true });

    await userEvent.type(input(), "abcd");

    expect(screen.queryByText("check")).toBeNull();
    expect(document.querySelector(".MuiCircularProgress-root")).not.toBeNull();
  });

  it("does not report a value as taken before the check has run", async () => {
    renderField({ isValid: false });

    await userEvent.type(input(), "abcd");

    expect(screen.queryByText("error_outline")).toBeNull();
    expect(document.querySelector(".Mui-error")).toBeNull();
  });
});
