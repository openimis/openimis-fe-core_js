import React, { useState } from "react";
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

const { default: ValidatedTextAreaInput } = await import("./ValidatedTextAreaInput");
const { renderWithProviders, userEvent, waitFor } = await import("../../testing");

const field = () => document.querySelector("textarea:not([aria-hidden]), input");

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  plainTextField.on = false;
});

// Sends every keystroke of `text` in one task, as a barcode scanner (or Cypress typing
// with no delay) does, and returns the errors React threw meanwhile.
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
      setNativeValue.call(field(), text.slice(0, i));
      field().dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

const renderField = () => {
  const action = vi.fn(() => ({ type: "TEST_VALIDATION_REQ" }));
  const Caller = () => {
    const [value, setValue] = useState("");
    return (
      <ValidatedTextAreaInput
        itemQueryIdentifier="schema"
        codeTakenLabel="invalid"
        module="core"
        label="schema"
        shouldValidate={() => true}
        action={action}
        clearAction={() => ({ type: "TEST_VALIDATION_CLEAR" })}
        setValidAction={() => ({ type: "TEST_VALIDATION_SET_VALID" })}
        value={value}
        onChange={setValue}
      />
    );
  };
  renderWithProviders(<Caller />);
  return { action };
};

describe("ValidatedTextAreaInput", () => {
  it("queries once, for the final value, after the user stops typing", async () => {
    const { action } = renderField();

    await userEvent.type(field(), "abcd");
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), { timeout: 2000 });

    expect(action.mock.calls[0][1]).toEqual({ schema: "abcd" });
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a keystroke must not leave work behind.
  it("takes a burst of keystrokes typed in one task", () => {
    plainTextField.on = true;
    renderField();
    const text = '{"type": "object", "properties": {"able_bodied": {"type": "boolean"}}}';

    const errors = typeInOneTask(text);

    expect(errors).toEqual([]);
    expect(field().value).toBe(text);
  });
});
