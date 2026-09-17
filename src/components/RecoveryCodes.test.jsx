import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RecoveryCodes from "./RecoveryCodes";
import { fireEvent, renderWithProviders, screen, userEvent, waitFor } from "../testing";

const messages = {
  "core.RecoveryCodes.copy": "Copy codes",
  "core.RecoveryCodes.copied": "Copied",
  "core.RecoveryCodes.saved": "I have saved my recovery codes",
  "core.RecoveryCodes.continueBtn": "Continue",
};

const CODES = ["aaaa1111", "bbbb2222"];

const render = (props = {}) =>
  renderWithProviders(<RecoveryCodes codes={CODES} onAcknowledged={() => {}} {...props} />, { messages });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("RecoveryCodes", () => {
  it("gates the continue button on the acknowledgement", async () => {
    const onAcknowledged = vi.fn();
    const user = userEvent.setup();
    render({ onAcknowledged });

    const cont = screen.getByRole("button", { name: "Continue" });
    expect(cont).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    await user.click(cont);

    expect(onAcknowledged).toHaveBeenCalledTimes(1);
  });

  // userEvent installs its own clipboard stub, so these two drive the button
  // with fireEvent and define the property on the real navigator instead.
  const setClipboard = (value) =>
    Object.defineProperty(navigator, "clipboard", { value, configurable: true, writable: true });

  it("says Copied only when the clipboard really took the codes", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render();

    fireEvent.click(screen.getByRole("button", { name: "Copy codes" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(CODES.join("\n")));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("does not claim to have copied when there is no clipboard, as on plain http", async () => {
    setClipboard(undefined);
    render();

    fireEvent.click(screen.getByRole("button", { name: "Copy codes" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Copy codes" })).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Copied" })).toBeNull();
  });
});
