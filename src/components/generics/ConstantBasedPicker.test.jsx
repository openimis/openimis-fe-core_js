import React from "react";
import { describe, expect, it } from "vitest";

import ConstantBasedPicker from "./ConstantBasedPicker";
import { renderWithProviders, screen } from "../../testing";

const messages = {
  "claim.claimStatus.null": "Any",
  "claim.claimStatus.0": "Error",
  "claim.claimStatus.1": "Rejected",
};

describe("ConstantBasedPicker", () => {
  const renderPicker = (props = {}) =>
    renderWithProviders(
      <ConstantBasedPicker module="claim" label="claimStatus" constants={[0, 1]} onChange={() => {}} {...props} />,
      { messages },
    );

  it("displays the constant it is mounted with", () => {
    renderPicker({ value: 1, readOnly: true });

    expect(screen.getByDisplayValue("Rejected")).toBeInTheDocument();
  });

  // 0 is a constant like any other (e.g. the Error claim status, OP-3239), not "no value"
  it("displays the constant 0 it is mounted with", () => {
    renderPicker({ value: 0, readOnly: true });

    expect(screen.getByDisplayValue("Error")).toBeInTheDocument();
  });
});
