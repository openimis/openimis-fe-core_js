import React, { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { default: TextInput } = await import("./TextInput");
const { renderWithProviders, screen, userEvent } = await import("../../testing");

const input = () => document.querySelector("input");

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("TextInput", () => {
  it("shows the value it is given", () => {
    renderWithProviders(<TextInput value="Receptionist" onChange={() => {}} />);

    expect(input().value).toBe("Receptionist");
  });

  it("reports every keystroke to the caller", async () => {
    const onChange = vi.fn();
    renderWithProviders(<TextInput value="" onChange={onChange} />);

    await userEvent.type(input(), "abc");

    expect(onChange.mock.calls.map(([v]) => v)).toEqual(["a", "ab", "abc"]);
  });

  it("adopts a value changed from the outside", () => {
    const { rerender } = renderWithProviders(<TextInput value="a" onChange={() => {}} />);

    rerender(<TextInput value="Claim Admin" onChange={() => {}} />);

    expect(input().value).toBe("Claim Admin");
  });

  // The value prop travels through the store (and, for validated fields, a debounced
  // query), so it lands back on the input after the user has typed further characters.
  it("keeps characters typed while its own value is travelling back", async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(<TextInput value="" onChange={onChange} />);

    await userEvent.type(input(), "abcd");
    rerender(<TextInput value="abcd" onChange={onChange} />);

    expect(input().value).toBe("abcd");
  });

  it("keeps characters typed while a stale echo is in flight", async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(<TextInput value="" onChange={onChange} />);

    await userEvent.type(input(), "abcd");
    // A late flush of an earlier value, as a debounced caller produces.
    rerender(<TextInput value="ab" onChange={onChange} />);

    expect(input().value).toBe("abcd");
  });

  it("still accepts an outside value equal to one typed earlier", async () => {
    const Caller = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <TextInput value={value} onChange={setValue} />
          <button onClick={() => setValue("ab")}>reset</button>
        </>
      );
    };
    renderWithProviders(<Caller />);

    await userEvent.type(input(), "abc");
    await userEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(input().value).toBe("ab");
  });

  // A barcode scanner (or Cypress typing with no delay) sends every keystroke in one task,
  // before React gets to the low-priority work a form schedules from its effects. React 19
  // counts each keystroke commit made while that work waits as a nested update and throws
  // "Maximum update depth exceeded" past 50, so a keystroke must cost a single commit.
  it("takes a burst of keystrokes typed in one task", () => {
    const Summary = ({ value }) => {
      const [length, setLength] = useState(0);
      useEffect(() => setLength(value.length), [value]);
      return <span>{length}</span>;
    };
    const Caller = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <TextInput value={value} onChange={setValue} />
          <Summary value={value} />
        </>
      );
    };
    renderWithProviders(<Caller />);
    const errors = [];
    const onError = (event) => {
      errors.push(event.error?.message ?? event.message);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    const text = "4012345678901 Ada Lovelace";
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

    expect(errors).toEqual([]);
    expect(input().value).toBe(text);
  });
});
