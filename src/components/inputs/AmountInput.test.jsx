import React, { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The package barrel imports itself; take the real helper from the module that defines it.
vi.mock("@openimis/fe-core", async () => {
  const modules = await vi.importActual("../../helpers/modules");
  return { withModulesManager: modules.default };
});

const { default: AmountInput } = await import("./AmountInput");
const { renderWithProviders, screen } = await import("../../testing");

// Sends every keystroke of `text` to `input` in one task, as Cypress typing with no delay
// (or a barcode scanner) does, and returns the errors React threw meanwhile.
const typeInOneTask = (input, text) => {
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
      setNativeValue.call(input, text.slice(0, i));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

// A form typed into while it shows an amount, as the review of a claim shows the
// prices of its services while an adjustment is typed: every keystroke renders it again.
const FormWithAmount = () => {
  const [text, setText] = useState("");
  return (
    <>
      <input data-testid="typed" value={text} onChange={(e) => setText(e.target.value)} />
      <AmountInput readOnly value={10} />
    </>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("AmountInput", () => {
  it("shows the amount with the currency", () => {
    renderWithProviders(<AmountInput readOnly value={10} />, { messages: { currency: "$" } });

    expect(screen.getByDisplayValue("10.00")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  // The currency adornment was a new element on every render, so MUI's input told its
  // FormControl about it again from an effect: low-priority work left waiting after each
  // commit. React 19 counts every commit made while such work waits as a nested update
  // and throws "Maximum update depth exceeded" (minified #185) past 50, which a burst of
  // keystrokes elsewhere in the form reached (UAT OCM-42, adjusting a claim under review).
  it("takes a burst of keystrokes typed elsewhere in the form", () => {
    // MUI's development build gives FormControl a new context on every render, which makes
    // its input repeat that effect whatever the adornment: render MUI as in production.
    vi.stubEnv("NODE_ENV", "production");
    const { unmount } = renderWithProviders(<FormWithAmount />);
    const text = "UAT adjustment K3ZQ 1795070000000, checked against the price list";

    const errors = typeInOneTask(screen.getByTestId("typed"), text);
    const typed = screen.getByTestId("typed").value;
    unmount();
    vi.unstubAllEnvs();

    expect(errors).toEqual([]);
    expect(typed).toBe(text);
  });
});
