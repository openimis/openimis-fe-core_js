import React from "react";
import { describe, expect, it } from "vitest";

import TabPanel from "./TabPanel";
import { renderWithProviders, screen } from "../../testing";

// Published as core.TabPanel (OP-3349). The barrel is not imported here: it
// self-imports @openimis/fe-core, which cannot load in isolation.
const renderTab = (value, index) =>
  renderWithProviders(
    <TabPanel value={value} index={index} data-testid="tab-panel">
      <span>tab content</span>
    </TabPanel>,
  );

describe("TabPanel", () => {
  it("renders its children when value equals index", () => {
    renderTab("tab-a", "tab-a");

    expect(screen.getByText("tab content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-panel")).toBeVisible();
  });

  it("renders a hidden, empty panel when value differs from index", () => {
    renderTab("tab-b", "tab-a");

    expect(screen.queryByText("tab content")).not.toBeInTheDocument();
    expect(screen.getByTestId("tab-panel")).not.toBeVisible();
  });
});
