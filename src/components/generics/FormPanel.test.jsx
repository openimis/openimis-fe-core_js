import React, { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FormPanel from "./FormPanel";
import TextInput from "../inputs/TextInput";
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

class TitlePanel extends FormPanel {
  render() {
    return (
      <>
        <TextInput value={this.getAttribute("title")} onChange={(v) => this.updateAttribute("title", v)} />
        <output>{this.getAttribute("code")}</output>
      </>
    );
  }
}

// Schedules low-priority work on every change, as pages do from their effects.
const Summary = ({ edited }) => {
  const [length, setLength] = useState(0);
  useEffect(() => setLength(edited?.title?.length ?? 0), [edited]);
  return <span>{length}</span>;
};

const Page = ({ initial = {} }) => {
  const [edited, setEdited] = useState(initial);
  return (
    <>
      <TitlePanel edited={edited} onEditedChanged={setEdited} />
      <Summary edited={edited} />
    </>
  );
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("FormPanel", () => {
  it("shows the entity it is given", () => {
    renderWithProviders(<Page initial={{ code: "T-1", title: "Water" }} />);

    expect(input().value).toBe("Water");
    expect(document.querySelector("output").textContent).toBe("T-1");
  });

  it("follows an entity replaced by the page", () => {
    const { rerender } = renderWithProviders(<TitlePanel edited={{ title: "Water" }} onEditedChanged={() => {}} />);

    rerender(<TitlePanel edited={{ title: "Power" }} onEditedChanged={() => {}} />);

    expect(input().value).toBe("Power");
  });

  it("keeps the other attributes when one changes", () => {
    renderWithProviders(<Page initial={{ code: "T-1" }} />);

    typeInOneTask("abc");

    expect(input().value).toBe("abc");
    expect(document.querySelector("output").textContent).toBe("T-1");
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
