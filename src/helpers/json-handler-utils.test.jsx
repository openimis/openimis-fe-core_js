import React from "react";
import { describe, expect, it, vi } from "vitest";

// The component imports drag in a circular chain (UserPicker -> withModulesManager)
// that fails when this helper is imported on its own. Irrelevant to the parser.
vi.mock("../components/inputs/TextInput", () => ({
  default: (props) => <div data-testid="text-input" data-label={props.label} data-value={String(props.value)} />,
}));
vi.mock("../components/inputs/NumberInput", () => ({
  default: (props) => <div data-testid="number-input" data-label={props.label} data-value={String(props.value)} />,
}));

const { createFieldsBasedOnJSON, renderInputComponent } = await import("./json-handler-utils");
const { renderWithProviders, screen } = await import("../testing");

describe("createFieldsBasedOnJSON", () => {
  it("turns each property into a field tagged with its runtime type", () => {
    const json = JSON.stringify({ age: 42, name: "Ada", active: true });

    expect(createFieldsBasedOnJSON(json)).toEqual([
      { fieldType: "number", field: { age: 42 } },
      { fieldType: "string", field: { name: "Ada" } },
      { fieldType: "boolean", field: { active: true } },
    ]);
  });

  it("returns an empty list for missing input", () => {
    expect(createFieldsBasedOnJSON(null)).toEqual([]);
    expect(createFieldsBasedOnJSON(undefined)).toEqual([]);
    expect(createFieldsBasedOnJSON("")).toEqual([]);
  });

  it("returns an empty list for an empty object", () => {
    expect(createFieldsBasedOnJSON("{}")).toEqual([]);
  });

  it("reads from a nested property when a stream is given", () => {
    const json = JSON.stringify({ beneficiary: { income: 100 }, other: { ignored: 1 } });

    expect(createFieldsBasedOnJSON(json, "beneficiary")).toEqual([{ fieldType: "number", field: { income: 100 } }]);
  });

  it("ignores the stream when the payload is empty", () => {
    expect(createFieldsBasedOnJSON("{}", "beneficiary")).toEqual([]);
  });

  it("preserves null values, typed as objects", () => {
    expect(createFieldsBasedOnJSON(JSON.stringify({ note: null }))).toEqual([
      { fieldType: "object", field: { note: null } },
    ]);
  });

  it("throws on malformed json rather than returning a partial result", () => {
    expect(() => createFieldsBasedOnJSON("{not json")).toThrow();
  });

  it("throws when the requested stream is absent", () => {
    expect(() => createFieldsBasedOnJSON(JSON.stringify({ a: 1 }), "missing")).toThrow();
  });
});

describe("renderInputComponent", () => {
  const field = (value) => ({ fieldType: typeof value, field: { income: value } });

  it("uses the number input for numeric fields", () => {
    renderWithProviders(renderInputComponent("core", field(100)));

    expect(screen.getByTestId("number-input")).toHaveAttribute("data-value", "100");
  });

  it("uses the text input for everything else", () => {
    renderWithProviders(renderInputComponent("core", field("Ada")));

    expect(screen.getByTestId("text-input")).toHaveAttribute("data-value", "Ada");
  });

  it("labels with the raw property name by default", () => {
    renderWithProviders(renderInputComponent("core", field("Ada")));

    expect(screen.getByTestId("text-input")).toHaveAttribute("data-label", "income");
  });

  it("builds a translation key when asked", () => {
    renderWithProviders(renderInputComponent("socialProtection", field("Ada"), true));

    expect(screen.getByTestId("text-input")).toHaveAttribute("data-label", "socialProtection.additionalFields.income");
  });
});
