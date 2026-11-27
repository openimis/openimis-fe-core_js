import React, { Profiler, useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Table from "./Table";
import { renderWithProviders, screen } from "../../testing";

const items = Array.from({ length: 40 }, (_, n) => ({ uuid: `u${n}`, name: `Row ${n}` }));

const rowBoxes = () => [...document.querySelectorAll("tbody input[type=checkbox]")];
const allBox = () => document.querySelector("thead input[type=checkbox]");

// Clicks every element in one task, as a script (or Cypress checking several boxes) does,
// and returns the errors React threw meanwhile.
const clickInOneTask = (elements) => {
  const errors = [];
  const onError = (event) => {
    errors.push(event.error?.message ?? event.message);
    event.preventDefault();
  };
  window.addEventListener("error", onError);
  const actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    elements.forEach((element) => element.click());
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

// Schedules low-priority work on every change, as searchers do from their effects.
const Summary = ({ selection }) => {
  const [count, setCount] = useState(0);
  useEffect(() => setCount(selection.length), [selection]);
  return <span data-testid="count">{count}</span>;
};

const Page = ({ onChangeSelection = () => {}, onCommit = () => {} }) => {
  const [selection, setSelection] = useState([]);
  return (
    <Profiler id="page" onRender={onCommit}>
      <Table
        module="test"
        items={items}
        headers={["Table.name"]}
        itemFormatters={[(i) => i.name]}
        withSelection="multiple"
        selectWithCheckbox
        onChangeSelection={(s) => {
          onChangeSelection(s);
          setSelection(s);
        }}
      />
      <Summary selection={selection} />
    </Profiler>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Table with selection checkboxes", () => {
  it("reports the selection after each box checked or unchecked", () => {
    const onChangeSelection = vi.fn();
    renderWithProviders(<Page onChangeSelection={onChangeSelection} />);

    clickInOneTask([rowBoxes()[0], rowBoxes()[1], rowBoxes()[0]]);

    expect(onChangeSelection.mock.calls).toEqual([[[items[0]]], [[items[0], items[1]]], [[items[1]]]]);
    expect(rowBoxes().map((box) => box.checked).slice(0, 3)).toEqual([false, true, false]);
  });

  it("selects every row, then none, from the header box", () => {
    const onChangeSelection = vi.fn();
    renderWithProviders(<Page onChangeSelection={onChangeSelection} />);

    clickInOneTask([allBox()]);
    clickInOneTask([allBox()]);

    expect(onChangeSelection.mock.calls).toEqual([[items], [[]]]);
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a checkbox commits on its own event, so
  // a box checked must cost a single commit.
  it("takes a burst of boxes checked in one task", async () => {
    renderWithProviders(<Page />);

    const errors = clickInOneTask(rowBoxes());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errors).toEqual([]);
    expect(screen.getByTestId("count").textContent).toBe(String(items.length));
    // 40 MUI checkboxes take a few seconds on a busy machine.
  }, 20_000);

  // What costs the extra commit: telling the caller from a setState callback makes the
  // caller's update a commit of its own, nested in the table's.
  it("commits a box checked together with the caller's update", () => {
    const commits = [];
    renderWithProviders(<Page onCommit={(id, phase) => commits.push(phase)} />);
    commits.length = 0;

    clickInOneTask([rowBoxes()[0]]);

    // One commit for the table and the caller; the Summary effect runs later.
    expect(commits).toEqual(["update"]);
  });
});
