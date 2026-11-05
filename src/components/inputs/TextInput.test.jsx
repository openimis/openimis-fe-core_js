import React, { useState } from "react";
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
});
