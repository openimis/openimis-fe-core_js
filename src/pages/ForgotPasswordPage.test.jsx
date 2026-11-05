import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordPage from "./ForgotPasswordPage";
import { renderWithProviders, screen, userEvent } from "../testing";
import messages from "../translations/en.json";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../helpers/hooks", async (importOriginal) => ({
  ...(await importOriginal()),
  useGraphqlMutation: () => ({ isLoading: false, mutate }),
}));

const DONE = messages["core.ForgotPasswordPage.done"];

const submit = async () => {
  renderWithProviders(<ForgotPasswordPage />, { messages });
  await userEvent.type(screen.getByRole("textbox"), "jdoe");
  await userEvent.click(screen.getByRole("button", { name: messages["core.ForgotPasswordPage.submitBtn"] }));
};

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it("confirms the request once the server accepted it", async () => {
    mutate.mockResolvedValue({ resetPassword: { success: true, error: null } });

    await submit();

    expect(mutate).toHaveBeenCalledWith({ username: "jdoe" });
    expect(await screen.findByText(DONE)).toBeInTheDocument();
  });

  it("does not claim success when the server refused the mutation", async () => {
    mutate.mockRejectedValue(new Error("Bad Request"));

    await submit();

    expect(await screen.findByText(messages["core.ForgotPasswordPage.error"])).toBeInTheDocument();
    expect(screen.queryByText(DONE)).not.toBeInTheDocument();
  });

  it("does not claim success when the mutation yields nothing", async () => {
    // What the page got when the server answered 400 to the enriched operation.
    mutate.mockResolvedValue(undefined);

    await submit();

    expect(await screen.findByText(messages["core.ForgotPasswordPage.error"])).toBeInTheDocument();
    expect(screen.queryByText(DONE)).not.toBeInTheDocument();
  });

  it("shows the error the server reported", async () => {
    mutate.mockResolvedValue({ resetPassword: { success: false, error: "Failed to reset password." } });

    await submit();

    expect(await screen.findByText("Failed to reset password.")).toBeInTheDocument();
    expect(screen.queryByText(DONE)).not.toBeInTheDocument();
  });
});
