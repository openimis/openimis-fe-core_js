import React from "react";
import { describe, expect, it, vi } from "vitest";

// The picker imports from the fe-core barrel, which cannot be loaded on its own
// from a test. Stub what it reaches; the Autocomplete stub keeps the props it got.
const autocompleteProps = vi.fn();
vi.mock("@openimis/fe-core", async () => {
  const ReactActual = (await import("react")).default;
  const { mockModulesManager } = await import("../../../testing");
  return {
    withModulesManager: (Component) =>
      function WithModulesManager(props) {
        return ReactActual.createElement(Component, { ...props, modulesManager: mockModulesManager() });
      },
    Autocomplete: (props) => {
      autocompleteProps(props);
      return null;
    },
  };
});

vi.mock("../../actions", () => ({ fetchEnrolmentOfficers: () => ({ type: "TEST_FETCH_EOS" }) }));

const { default: EnrolmentOfficerPicker } = await import("./EnrolmentOfficerPicker");
const { renderWithProviders, makeStore } = await import("../../../testing");

const optionLabel = (officer) => {
  const store = makeStore({
    reducers: { admin: (state = { enrolmentOfficers: { items: [], isFetching: false } }) => state },
  });
  renderWithProviders(<EnrolmentOfficerPicker onChange={() => {}} />, { store });
  return autocompleteProps.mock.calls.at(-1)[0].getOptionLabel(officer);
};

describe("EnrolmentOfficerPicker", () => {
  // The search matches the officer's code, which the label used to leave out:
  // typing a code listed only a name (Tools > Extracts, OCM-704).
  it("labels an officer with its code, then its names", () => {
    expect(optionLabel({ code: "BLEO01", lastName: "Fairbrook", otherNames: "Ada" })).toBe("BLEO01 - Fairbrook Ada");
  });

  it("labels an officer without a code with its names only", () => {
    expect(optionLabel({ lastName: "Fairbrook", otherNames: "Ada" })).toBe("Fairbrook Ada");
  });
});
