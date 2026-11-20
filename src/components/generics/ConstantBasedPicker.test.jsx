import React, { Profiler, useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ConstantBasedPicker from "./ConstantBasedPicker";
import SelectInput from "../inputs/SelectInput";
import { renderWithProviders, screen } from "../../testing";

const messages = {
  "claim.claimStatus.null": "Any",
  "claim.claimStatus.0": "Error",
  "claim.claimStatus.1": "Rejected",
};

// MUI's Select keeps the chosen value in a hidden input, which browser autofill (or a
// script) can set; each change commits on its own, even many in one task.
const hiddenInput = () => document.querySelector("input[aria-hidden]");

// Picks every constant in turn, in one task, through the hidden input, and returns the
// errors React threw meanwhile.
const pickInOneTask = (values) => {
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
    for (const value of values) {
      if (!hiddenInput()) break;
      setNativeValue.call(hiddenInput(), JSON.stringify(value));
      hiddenInput().dispatchEvent(new Event("change", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

// Schedules low-priority work on every change, as pages do from their effects.
const Summary = ({ value }) => {
  const [shown, setShown] = useState(null);
  useEffect(() => setShown(value), [value]);
  return <span>{String(shown)}</span>;
};

const constants = Array.from({ length: 30 }, (_, n) => n);

// Starts with a constant picked, other than 0: SelectInput shows a clear button for a
// truthy value only, and MUI's field commits once more when that button comes or goes,
// which is not what the tests below measure.
const Page = ({ onChange = () => {}, onCommit = () => {}, Picker = ConstantBasedPicker }) => {
  const [value, setValue] = useState(2);
  return (
    <Profiler id="page" onRender={onCommit}>
      <Picker
        module="claim"
        label="claimStatus"
        constants={constants}
        options={constants.map((c) => ({ value: c, label: String(c) }))}
        value={value}
        onChange={(v, label) => {
          onChange(v, label);
          setValue(v);
        }}
      />
      <Summary value={value} />
    </Profiler>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ConstantBasedPicker", () => {
  const renderPicker = (props = {}) =>
    renderWithProviders(
      <ConstantBasedPicker module="claim" label="claimStatus" constants={[0, 1]} onChange={() => {}} {...props} />,
      { messages },
    );

  it("displays the constant it is mounted with", () => {
    renderPicker({ value: 1, readOnly: true });

    expect(screen.getByDisplayValue("Rejected")).toBeInTheDocument();
  });

  // 0 is a constant like any other (e.g. the Error claim status, OP-3239), not "no value"
  it("displays the constant 0 it is mounted with", () => {
    renderPicker({ value: 0, readOnly: true });

    expect(screen.getByDisplayValue("Error")).toBeInTheDocument();
  });

  it("displays a new constant given by the caller", () => {
    const { rerender } = renderPicker({ value: 0, readOnly: true });

    rerender(
      <ConstantBasedPicker module="claim" label="claimStatus" constants={[0, 1]} value={1} readOnly onChange={() => {}} />,
    );

    expect(screen.getByDisplayValue("Rejected")).toBeInTheDocument();
  });

  it("reports every constant picked, with its label, in order", () => {
    const onChange = vi.fn();
    renderWithProviders(<Page onChange={onChange} />, { messages });

    pickInOneTask([1, 0, 1]);

    expect(onChange.mock.calls).toEqual([
      [1, "Rejected"],
      [0, "Error"],
      [1, "Rejected"],
    ]);
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a constant picked must cost a single
  // commit.
  it("takes a burst of constants picked in one task", () => {
    renderWithProviders(<Page />, { messages });

    const errors = pickInOneTask(constants);

    expect(errors).toEqual([]);
    expect(hiddenInput().value).toBe(String(constants.at(-1)));
  });

  // What costs the extra commits: telling the caller from a setState callback (the
  // caller's update is then a commit of its own) and copying the new value prop into state
  // in componentDidUpdate (one more). MUI's select commits once more on its own (in
  // development builds at least), so the picker is measured against a bare SelectInput.
  it("commits a constant picked together with the caller's update", () => {
    const commitsOf = (Picker) => {
      const commits = [];
      const { unmount } = renderWithProviders(
        <Page Picker={Picker} onCommit={(id, phase) => commits.push(phase)} />,
        { messages },
      );
      commits.length = 0;
      pickInOneTask([1]);
      unmount();
      return commits;
    };

    expect(commitsOf(ConstantBasedPicker)).toEqual(commitsOf(SelectInput));
  });
});
