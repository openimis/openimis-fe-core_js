import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AutoSuggestion from "./AutoSuggestion";
import { fireEvent, renderWithProviders, screen, waitFor } from "../../testing";

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

// A form reopened on a saved record hands the picker its value: the picker shows it, in
// the autocomplete (an Insuree's Profession shows "Employee" again, not an empty field).
describe("AutoSuggestion given a value", () => {
  it("shows the value's label", () => {
    const { container } = renderWithProviders(
      <AutoSuggestion
        module="insuree"
        label="Profession"
        items={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]}
        getSuggestionValue={(i) => `Profession ${i.id}`}
        onSuggestionSelected={() => {}}
        value={{ id: 2 }}
        selectThreshold={10}
      />,
    );

    expect(container.querySelector('input[role="combobox"]')).toHaveValue("Profession 2");
  });
});

describe("AutoSuggestion picking a suggestion", () => {
  it("closes the list once a suggestion is picked", async () => {
    const onSuggestionSelected = vi.fn();
    renderWithProviders(
      <AutoSuggestion
        module="location"
        label="Region"
        items={[1, 2, 3, 4, 5, 6, 7]}
        getSuggestionValue={(i) => `Region ${i}`}
        onSuggestionSelected={onSuggestionSelected}
        selectThreshold={5}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Region 3" } });
    fireEvent.click(await screen.findByText("Region 3", { selector: "li *, li" }));

    expect(onSuggestionSelected).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });
});
