import React from "react";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ResponsiveDialog from "./ResponsiveDialog";
import { renderWithProviders } from "../../testing";

// jsdom does not lay out, so these check the CSS the paper gets, not pixel positions.
const injectedCss = () => [...document.querySelectorAll("style")].map((s) => s.textContent).join("\n");

const renderDialog = (props = {}) =>
  renderWithProviders(
    <ResponsiveDialog open onClose={() => {}} {...props}>
      <DialogTitle>Title</DialogTitle>
      <DialogContent>Content</DialogContent>
      <DialogActions>
        <button type="button">Save</button>
      </DialogActions>
    </ResponsiveDialog>,
  );

describe("ResponsiveDialog", () => {
  it("bounds the paper by the viewport", () => {
    renderDialog();

    expect(injectedCss()).toContain("max-height:calc(100% - 64px)");
  });

  it("keeps a requested height only while it fits the viewport", () => {
    renderDialog({ maxPaperHeight: 800 });

    // OP-3306: a bare `maxHeight: 800` let the paper outgrow a 670px viewport.
    expect(injectedCss()).toContain("max-height:min(800px, calc(100% - 64px))");
    expect(injectedCss()).not.toMatch(/max-height:800px/);
  });

  it("keeps the actions outside the scrolling content", () => {
    renderDialog();

    const content = screen.getByText("Content");
    expect(content).toHaveClass("MuiDialogContent-root");
    expect(content).not.toContainElement(screen.getByRole("button", { name: "Save" }));
  });

  it("goes full screen below the breakpoint", () => {
    vi.stubGlobal("matchMedia", (query) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }));

    renderDialog({ maxPaperHeight: 800 });

    expect(document.querySelector(".MuiDialog-paper")).toHaveClass("MuiDialog-paperFullScreen");
    vi.unstubAllGlobals();
  });

  it("keeps the caller's paper styles", () => {
    renderDialog({ slotProps: { paper: { sx: [{ minWidth: 321 }] } } });

    expect(injectedCss()).toContain("min-width:321px");
  });
});
