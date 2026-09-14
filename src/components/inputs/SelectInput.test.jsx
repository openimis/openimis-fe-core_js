import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SelectInput from "./SelectInput";
import { renderWithProviders, screen } from "../../testing";

const OPTIONS = [1, 2, 3, 4].map((value) => ({ value, label: `Option ${value}` }));

// MUI logs "out-of-range value" on every render of a select whose value matches no
// option, which made typing in a form holding such a select visibly slow.
let warn;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

const outOfRangeWarnings = () => warn.mock.calls.filter(([first]) => String(first).includes("out-of-range value"));

describe("SelectInput", () => {
  const renderInput = (props = {}) =>
    renderWithProviders(<SelectInput module="core" options={OPTIONS} onChange={() => {}} {...props} />);

  it("displays the option matching the value", () => {
    renderInput({ value: 3 });

    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("stays quiet when there is no value", () => {
    renderInput({ value: null });

    expect(outOfRangeWarnings()).toHaveLength(0);
  });

  it("stays quiet when the value is not among the options", () => {
    // Happens while a picker's options are still being fetched.
    renderInput({ value: 42 });

    expect(outOfRangeWarnings()).toHaveLength(0);
  });
});
