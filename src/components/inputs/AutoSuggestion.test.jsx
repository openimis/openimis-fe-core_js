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
