import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SetPasswordPage from "./SetPasswordPage";
import { renderWithProviders, screen, userEvent } from "../testing";
import messages from "../translations/en.json";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../helpers/hooks", async (importOriginal) => ({
  ...(await importOriginal()),
  useGraphqlMutation: () => ({ isLoading: false, mutate }),
}));

// The password policy is fetched on mount; the page works without one.
vi.mock("../actions", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPasswordPolicy: () => ({ type: "TEST_NOOP" }),
}));

const submit = async () => {
  renderWithProviders(<SetPasswordPage />, { messages });
  await userEvent.type(screen.getByLabelText(new RegExp(messages["core.SetPasswordPage.username.label"])), "jdoe");
  await userEvent.click(screen.getByRole("button", { name: messages["core.SetPasswordPage.generatePassword"] }));
  await userEvent.click(screen.getByRole("button", { name: messages["core.SetPasswordPage.submitBtn"] }));
};

describe("SetPasswordPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    // The token comes from the link in the e-mail.
    window.history.pushState({}, "", "/set_password?token=abc");
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("shows an error when the server refused the mutation", async () => {
    mutate.mockRejectedValue(new Error("Bad Request"));

    await submit();

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ username: "jdoe", token: "abc" }));
    expect(await screen.findByText(messages["core.SetPasswordPage.error"])).toBeInTheDocument();
  });

  it("shows the error the server reported", async () => {
    mutate.mockResolvedValue({ setPassword: { success: false, error: "Invalid token" } });

    await submit();

    expect(await screen.findByText("Invalid token")).toBeInTheDocument();
  });
});
