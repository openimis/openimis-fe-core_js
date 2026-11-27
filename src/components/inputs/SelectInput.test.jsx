import React, { Profiler } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SelectInput from "./SelectInput";
import { fireEvent, renderWithProviders, screen, within } from "../../testing";

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

  // MUI 9 renders a select's label as a <div>; openIMIS keeps a <label>, which pages,
  // user scripts and the UAT suite locate fields by.
  it("renders its label as a label element", () => {
    const { container } = renderInput({ value: 3, strLabel: "Claim Status" });

    expect(container.querySelector("label")).toHaveTextContent("Claim Status");
  });

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

  describe("with no options", () => {
    const MESSAGES = { "core.pickerNoOptionsLabel": "No options available", "core.Autocomplete.loadingText": "Loading..." };
    const openList = (props) => {
      renderWithProviders(<SelectInput module="core" options={[]} onChange={() => {}} {...props} />, {
        messages: MESSAGES,
      });
      fireEvent.mouseDown(screen.getByRole("combobox"));
    };

    // OP-3280: pickers pass [] while they fetch, and tests read the empty entry as the result.
    it("shows Loading... while the options are loading", () => {
      openList({ loading: true });

      const option = screen.getByRole("option", { name: "Loading..." });
      expect(within(option).getByRole("progressbar")).toBeInTheDocument();
      expect(screen.queryByText("No options available")).not.toBeInTheDocument();
    });

    it("says there are no options once loading is over", () => {
      openList({ loading: false });

      expect(screen.getByRole("option", { name: "No options available" })).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("read-only", () => {
    // Commits of the subtree under the profiler: one per render pass React performs.
    const renderReadOnly = (value) => {
      const commits = [];
      const ui = (v) => (
        <Profiler id="select" onRender={(id, phase) => commits.push(phase)}>
          <SelectInput module="core" options={OPTIONS} value={v} readOnly onChange={() => {}} />
        </Profiler>
      );
      const view = renderWithProviders(ui(value));
      return { commits, rerender: (v) => view.rerender(ui(v)) };
    };

    it("displays the label of the option matching the value", () => {
      renderReadOnly(3);

      expect(screen.getByRole("textbox")).toHaveValue("Option 3");
    });

    it("follows a change of value", () => {
      const { rerender } = renderReadOnly(3);

      rerender(2);

      expect(screen.getByRole("textbox")).toHaveValue("Option 2");
    });

    it("costs a single commit when the parent re-renders with the same value", () => {
      // The read-only text used to be a new array on every render: TextInput saw a new
      // value in componentDidUpdate and called setState during the commit, so every
      // keystroke elsewhere in the form paid a second, nested commit (OCM-42).
      const { commits, rerender } = renderReadOnly(3);
      commits.length = 0;

      rerender(3);

      expect(commits).toEqual(["update"]);
    });
  });
});
