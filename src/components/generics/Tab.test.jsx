import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "@mui/material";
import { fireEvent, renderWithProviders, screen } from "../../testing";
import Tab from "./Tab";

// openIMIS pages lay out tab labels contributed by several modules themselves
// (a Grid of Contributions), not as direct children of MUI's <Tabs>. MUI 9's Tab
// throws when it is not inside a Tabs ("RovingTabIndexContext is missing").

describe("Tab", () => {
  it("renders outside a Tabs, as tab labels contributed to a page are", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <div>
        <Tab value="history" label="History" onChange={onChange} />
        <Tab value="tasks" label="Tasks" onChange={onChange} />
      </div>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Tasks" }));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "tasks");
  });

  it("still works as a child of MUI's Tabs", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Tabs value="a" onChange={onChange}>
        <Tab value="a" label="A" />
        <Tab value="b" label="B" />
      </Tabs>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "B" }));

    expect(onChange).toHaveBeenCalledWith(expect.anything(), "b");
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });
});
