import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { answers, status } = vi.hoisted(() => ({ answers: {}, status: { current: null } }));
vi.mock("../helpers/hooks", async () => ({
  ...(await vi.importActual("../helpers/hooks")),
  useGraphqlQuery: () => ({ data: status.current, isLoading: false, error: null, refetch: vi.fn() }),
  useGraphqlMutation: (operation) => {
    const name = operation.match(/mutation (\w+)/)[1];
    return { isLoading: false, mutate: (input) => answers[name](input) };
  },
}));

import SecondFactorPage from "./SecondFactorPage";
import { makeStore, renderWithProviders, screen, userEvent } from "../testing";

const messages = {
  "core.SecondFactorEnrolment.username.label": "Username",
  "core.SecondFactorPage.enrolledTitle": "An authenticator app is set up for your account",
  "core.SecondFactorPage.code.label": "Code from the app",
  "core.SecondFactorPage.issueBtn": "Get new recovery codes",
  "core.SecondFactorPage.error.INVALID_SECOND_FACTOR": "Wrong code",
  "core.RecoveryCodes.saved": "I have saved my recovery codes",
};

const CODES = [
  "AAAA1111",
  "BBBB2222",
  "CCCC3333",
  "DDDD4444",
  "EEEE5555",
  "FFFF6666",
  "GGGG7777",
  "HHHH8888",
  "IIII9999",
  "JJJJ0000",
];

const render = (hasSecondFactor) => {
  status.current = { user: { id: "VXNlcjox", hasSecondFactor } };
  const store = makeStore({ preloadedState: { core: { user: { username: "alice" } } } });
  return renderWithProviders(<SecondFactorPage />, { store, messages });
};

beforeEach(() => {
  answers.issueRecoveryCodes = vi.fn(async () => ({
    issueRecoveryCodes: { success: true, codes: CODES, error: null, lockedUntil: null },
  }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("SecondFactorPage", () => {
  it("offers enrolment to a user without a device, with their username fixed", () => {
    render(false);

    const username = screen.getByLabelText(/username/i);
    expect(username).toHaveValue("alice");
    expect(username).toBeDisabled();
    expect(screen.queryByText("An authenticator app is set up for your account")).toBeNull();
  });

  it("shows an enrolled user their status and the recovery-code form", () => {
    render(true);

    expect(screen.getByText("An authenticator app is set up for your account")).toBeInTheDocument();
    expect(screen.getByLabelText(/code from the app/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).toBeNull();
  });

  it("issues a new set for a current code and shows it once", async () => {
    const user = userEvent.setup();
    render(true);

    await user.type(screen.getByLabelText(/code from the app/i), "123456");
    await user.click(screen.getByRole("button", { name: "Get new recovery codes" }));

    expect(answers.issueRecoveryCodes).toHaveBeenCalledWith({ otp: "123456" });
    for (const code of CODES) {
      expect(await screen.findByText(code)).toBeInTheDocument();
    }
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("reports a wrong code and keeps the form", async () => {
    answers.issueRecoveryCodes = vi.fn(async () => ({
      issueRecoveryCodes: { success: false, codes: null, error: "INVALID_SECOND_FACTOR", lockedUntil: null },
    }));
    const user = userEvent.setup();
    render(true);

    await user.type(screen.getByLabelText(/code from the app/i), "000000");
    await user.click(screen.getByRole("button", { name: "Get new recovery codes" }));

    expect(await screen.findByText("Wrong code")).toBeInTheDocument();
    expect(screen.getByLabelText(/code from the app/i)).toBeInTheDocument();
  });
});
