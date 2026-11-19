import React, { useState } from "react";
import { useSelector } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

// In development builds MUI's FormControl re-publishes its context on every render, so a
// re-rendered TextField schedules low-priority work of its own on every keystroke; the
// production build does not. The burst test swaps in a plain input to keep that out of
// what it measures. The other tests keep the real TextField.
const plainTextField = vi.hoisted(() => ({ on: false }));
vi.mock("@mui/material", async (importOriginal) => {
  const actual = await importOriginal();
  const { forwardRef, createElement } = await import("react");
  return {
    ...actual,
    TextField: forwardRef((props, ref) =>
      plainTextField.on
        ? createElement("input", { ref, value: props.value ?? "", onChange: props.onChange })
        : createElement(actual.TextField, { ref, ...props }),
    ),
  };
});

const { default: ValidatedTextInput } = await import("./ValidatedTextInput");
const { makeStore, renderWithProviders, screen, waitFor, userEvent } = await import("../../testing");

const input = () => document.querySelector("input");

// Sends every keystroke of `text` in one task, as Cypress typing with no delay (or a
// barcode scanner) does, and returns the errors React threw meanwhile.
const typeInOneTask = (text) => {
  const errors = [];
  const onError = (event) => {
    errors.push(event.error?.message ?? event.message);
    event.preventDefault();
  };
  window.addEventListener("error", onError);
  const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  const actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    for (let i = 1; i <= text.length; i++) {
      // React unmounts the tree when it throws: nothing is left to type into.
      if (!input()) break;
      setNativeValue.call(input(), text.slice(0, i));
      input().dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

const messages = { "core.duplicate": "Name already used" };

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  plainTextField.on = false;
});

const renderField = ({ action, isValid, isValidating, shouldValidate = () => true } = {}) => {
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
        shouldValidate={shouldValidate}
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

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a keystroke must not leave work behind.
  it("takes a burst of keystrokes typed in one task", () => {
    plainTextField.on = true;
    renderField();
    const text = "Program of cash transfers for households, 2026 edition";

    const errors = typeInOneTask(text);

    expect(errors).toEqual([]);
    expect(input().value).toBe(text);
  });

  // A new entity's name is not checked (nothing saved to compare it with), and every
  // keystroke reset the pending flag that was already off. React 19 can still schedule a
  // render for such a setState, at low priority from the effect; during a burst of
  // keystrokes it never ran, React counted every commit as nested and threw "Maximum update
  // depth exceeded" past 50 characters (UAT OCM-1205, naming a new project).
  it("takes a burst of keystrokes when the value needs no check", () => {
    // MUI's development build gives FormControl a new context on every render, which makes
    // its input schedule work of its own after each commit: render MUI as in production.
    vi.stubEnv("NODE_ENV", "production");
    // As a project page: the verdict is kept in the store, which the field resets on change.
    const verdict = (state = {}, { type }) => (type === "TEST_VALIDATION_SET_VALID" ? { isValid: true } : state);
    const Caller = () => {
      const [value, setValue] = useState("");
      const { isValid, isValidating, validationError } = useSelector((state) => state.verdict);
      return (
        <ValidatedTextInput
          itemQueryIdentifier="projectName"
          codeTakenLabel="duplicate"
          module="core"
          label="projectName"
          shouldValidate={() => false}
          isValid={isValid}
          isValidating={isValidating}
          validationError={validationError}
          action={() => ({ type: "TEST_VALIDATION_REQ" })}
          clearAction={() => ({ type: "TEST_VALIDATION_CLEAR" })}
          setValidAction={() => ({ type: "TEST_VALIDATION_SET_VALID" })}
          value={value}
          onChange={setValue}
        />
      );
    };
    renderWithProviders(<Caller />, { messages, store: makeStore({ reducers: { verdict } }) });
    const text = "E2E Individual Training Project - 2026-11-19T12-30-01-123Z";

    const errors = typeInOneTask(text);
    const typed = input()?.value;
    vi.unstubAllEnvs();

    expect(errors).toEqual([]);
    expect(typed).toBe(text);
  });
});
