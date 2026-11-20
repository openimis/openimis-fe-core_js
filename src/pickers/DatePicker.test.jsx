import React, { Profiler, useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DatePicker from "./DatePicker";
import { act, renderWithProviders } from "../testing";

const input = () => document.querySelector("input");

// Day N of 2024 as the field shows it (DD-MM-YYYY) and as the picker reports it (ISO).
const day = (n) => new Date(Date.UTC(2024, 0, n));
const shown = (n) => day(n).toISOString().slice(0, 10).split("-").reverse().join("-");
const iso = (n) => day(n).toISOString().slice(0, 10);

// Enters `count` dates one after the other in one task, as a scanner or Cypress with no
// delay does, and returns the errors React threw meanwhile.
const enterInOneTask = (count) => {
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
    for (let n = 2; n < 2 + count && input(); n++) {
      setNativeValue.call(input(), shown(n));
      input().dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

// Schedules low-priority work on every change, as pages do from their effects.
const Summary = ({ value }) => {
  const [shownValue, setShownValue] = useState(null);
  useEffect(() => setShownValue(value), [value]);
  return <span>{shownValue}</span>;
};

// A plain input text field rather than the accessible sections, so a date can be entered
// with one input event.
const Page = ({ onChange = () => {}, onCommit = () => {} }) => {
  const [value, setValue] = useState(iso(1));
  return (
    <Profiler id="page" onRender={onCommit}>
      <DatePicker
        value={value}
        enableAccessibleFieldDOMStructure={false}
        onChange={(v) => {
          onChange(v);
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

describe("DatePicker", () => {
  it("shows the date it is given", () => {
    renderWithProviders(<Page />);

    expect(input().value).toBe(shown(1));
  });

  it("reports every date entered, in order", () => {
    const onChange = vi.fn();
    renderWithProviders(<Page onChange={onChange} />);

    enterInOneTask(3);

    expect(onChange.mock.calls).toEqual([[iso(2)], [iso(3)], [iso(4)]]);
    expect(input().value).toBe(shown(4));
  });

  it("shows a new date given by the caller", () => {
    const { rerender } = renderWithProviders(<DatePicker value={iso(1)} enableAccessibleFieldDOMStructure={false} />);

    rerender(<DatePicker value={iso(9)} enableAccessibleFieldDOMStructure={false} />);

    expect(input().value).toBe(shown(9));
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a date entered must cost a single commit.
  it("takes a burst of dates entered in one task", () => {
    renderWithProviders(<Page />);

    const errors = enterInOneTask(40);

    expect(errors).toEqual([]);
    expect(input().value).toBe(shown(41));
  });

  // jsdom may run the low-priority work sooner than a browser does; what costs the extra
  // commits is the picker telling the caller from a setState callback (the caller's update
  // is then a commit of its own) and copying the new value prop into its state in
  // componentDidUpdate (one more commit).
  //
  // Counted once the event has settled: with MUI X 9 the Summary effect's update commits
  // on the next tick instead of inside the event. What React 19 limits is nested updates,
  // so the test also checks that none of the commits is one.
  it("commits a date entered together with the caller's update", async () => {
    const commits = [];
    renderWithProviders(<Page onCommit={(id, phase) => commits.push(phase)} />);
    commits.length = 0;
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;

    setNativeValue.call(input(), shown(2));
    input().dispatchEvent(new Event("input", { bubbles: true }));
    await act(async () => {});

    // The change itself, then the Summary effect.
    expect(commits).toHaveLength(2);
    expect(commits).not.toContain("nested-update");
  });
});
