import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AutoSuggestion from "./AutoSuggestion";
import { renderWithProviders, screen } from "../../testing";

// Below the threshold the component renders a SelectInput; an unmatched value makes
// MUI warn on every render, once per keystroke in the form holding the picker.
let warn;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

const outOfRangeWarnings = () => warn.mock.calls.filter(([first]) => String(first).includes("out-of-range value"));

describe("AutoSuggestion below the select threshold", () => {
  const renderSuggestion = (props = {}) =>
    renderWithProviders(
      <AutoSuggestion
        module="insuree"
        items={[1, 2, 3, 4, 5, 6, 7]}
        getSuggestionValue={(i) => `Education ${i}`}
        onSuggestionSelected={() => {}}
        selectThreshold={10}
        {...props}
      />,
    );

  it("renders a select", () => {
    renderSuggestion();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("stays quiet when nothing is picked yet", () => {
    renderSuggestion();

    expect(outOfRangeWarnings()).toHaveLength(0);
  });
});

// A required picker must say so, in both modes: the report dialogs keep Generate disabled
// until it is set, and without the asterisk nothing tells the user why (OP-3241).
describe("AutoSuggestion marked required", () => {
  const renderRequired = (props = {}) =>
    renderWithProviders(
      <AutoSuggestion
        module="location"
        label="Region"
        items={[1, 2, 3, 4, 5, 6, 7]}
        getSuggestionValue={(i) => `Region ${i}`}
        onSuggestionSelected={() => {}}
        required
        {...props}
      />,
    );

  const requiredAsterisk = (container) => container.querySelector("label .MuiFormLabel-asterisk");

  it("shows the asterisk as a select, below the threshold", () => {
    const { container } = renderRequired({ selectThreshold: 10 });

    expect(requiredAsterisk(container)).toBeInTheDocument();
  });

  it("shows the asterisk as an autocomplete, at or above the threshold", () => {
    const { container } = renderRequired({ selectThreshold: 5 });

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-autocomplete");
    expect(requiredAsterisk(container)).toBeInTheDocument();
  });
});
