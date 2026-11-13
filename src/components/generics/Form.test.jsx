import React, { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Form from "./Form";
import { renderWithProviders } from "../../testing";

const input = () => document.querySelector("input");

// Sends every keystroke of `text` in one task, as a barcode scanner (or Cypress typing
// with no delay) does, and returns the errors React threw meanwhile.
const typeInOneTask = (text) => {
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
    for (let i = 1; i <= text.length; i++) {
      setNativeValue.call(input(), text.slice(0, i));
      input().dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

// A plain panel: it reports every keystroke to the form from the input's event.
const TitlePanel = ({ edited, onEditedChanged }) => (
  <input value={edited?.title ?? ""} onChange={(e) => onEditedChanged({ ...edited, title: e.target.value })} />
);

// Schedules low-priority work on every change, as pages and panels do from their effects.
const Summary = ({ edited }) => {
  const [length, setLength] = useState(0);
  useEffect(() => setLength(edited?.title?.length ?? 0), [edited]);
  return <span>{length}</span>;
};

const Page = () => {
  const [edited, setEdited] = useState({});
  return (
    <>
      <Form module="test" edited={edited} HeadPanel={TitlePanel} onEditedChanged={setEdited} save={() => {}} />
      <Summary edited={edited} />
    </>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Form", () => {
  it("passes every change of a panel to the page", () => {
    renderWithProviders(<Page />);

    typeInOneTask("abc");

    expect(input().value).toBe("abc");
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a change must cost a single commit.
  it("takes a burst of keystrokes typed in one task", () => {
    renderWithProviders(<Page />);
    const text = "4012345678901 Ada Lovelace, Analyst";

    const errors = typeInOneTask(text);

    expect(errors).toEqual([]);
    expect(input().value).toBe(text);
  });
});
