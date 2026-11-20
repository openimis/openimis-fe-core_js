import React, { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Autocomplete from "./Autocomplete";
import { renderWithProviders, screen } from "../../testing";

const titleInput = () => document.querySelector('input[name="title"]');

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
      setNativeValue.call(titleInput(), text.slice(0, i));
      titleInput().dispatchEvent(new Event("input", { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener("error", onError);
  }
  return errors;
};

const projects = [
  { id: "1", name: "Water" },
  { id: "2", name: "Roads" },
];

// A plain input rather than MUI's TextField: in development builds MUI's FormControl
// schedules low-priority work on every render, which the production build does not, and
// that would hide what the test measures.
// MUI 9 hands the input's props over in params.slotProps (input, htmlInput).
const renderPlainInput = (params) => (
  <div ref={params.slotProps.input.ref}>
    {params.slotProps.input.startAdornment}
    <input aria-label="projects" {...params.slotProps.htmlInput} />
  </div>
);

// Schedules low-priority work on every change, as pages do from their effects.
const Summary = ({ title }) => {
  const [length, setLength] = useState(0);
  useEffect(() => setLength(title.length), [title]);
  return <span>{length}</span>;
};

// A form whose picker gets its value rebuilt on every render, as pickers that map the
// selected entries onto the options they loaded do.
function ProjectForm() {
  const [title, setTitle] = useState("");
  return (
    <>
      <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Autocomplete
        multiple
        options={projects}
        value={[{ ...projects[0] }]}
        getOptionLabel={(option) => option.name}
        onChange={() => {}}
        onInputChange={() => {}}
        renderInput={renderPlainInput}
      />
      <Summary title={title} />
    </>
  );
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Autocomplete", () => {
  it("shows the selected entries", () => {
    renderWithProviders(<ProjectForm />);

    expect(screen.getByText("Water")).toBeInTheDocument();
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: re-rendering the picker with an equal
  // value must not remount it, or every keystroke in the form costs several commits.
  it("takes a burst of keystrokes typed in another field of the form", () => {
    // Keystrokes in one task can fall within the same millisecond; a scanner or a slower
    // machine spreads them over several.
    let now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => ++now);
    renderWithProviders(<ProjectForm />);
    const text = "Payroll of the water project, Q2";

    const errors = typeInOneTask(text);

    expect(errors).toEqual([]);
    expect(titleInput().value).toBe(text);
    expect(screen.getByText("Water")).toBeInTheDocument();
  });

  // The burst above does not reach the limit in jsdom, which runs the low-priority work
  // sooner than a browser does. What costs the extra commits in the browser is the picker
  // remounting MUI's Autocomplete (a new key) whenever it receives a new but equal value:
  // the payroll form crashed with "Maximum update depth exceeded" after ~20 characters
  // typed in its name, because its project picker rebuilds its value on every render.
  it("keeps its field when the form re-renders it with an equal value", async () => {
    let now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => ++now);
    renderWithProviders(<ProjectForm />);
    const projectsField = screen.getByLabelText("projects");

    typeInOneTask("Q2");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByLabelText("projects")).toBe(projectsField);
  });
});
