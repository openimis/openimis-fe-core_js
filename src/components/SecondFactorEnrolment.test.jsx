import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Each mutation is scripted by name.
const { answers, sentOperations } = vi.hoisted(() => ({ answers: {}, sentOperations: [] }));
vi.mock("../actions", async () => ({
  ...(await vi.importActual("../actions")),
  graphqlWithVariables: (operation, variables) => async () => {
    sentOperations.push(operation);
    const name = operation.match(/mutation (\w+)/)[1];
    const { clientMutationId, ...input } = variables.input;
    return { payload: { data: await answers[name](input) } };
  },
}));

import SecondFactorEnrolment, { groupSecret } from "./SecondFactorEnrolment";
import { renderWithProviders, screen, userEvent } from "../testing";

const messages = {
  "core.SecondFactorEnrolment.username.label": "Username",
  "core.SecondFactorEnrolment.password.label": "Password",
  "core.SecondFactorEnrolment.beginBtn": "Continue",
  "core.SecondFactorEnrolment.code.label": "Code from the app",
  "core.SecondFactorEnrolment.confirmBtn": "Confirm",
  "core.SecondFactorEnrolment.startOverBtn": "Start over",
  "core.SecondFactorEnrolment.error.INCORRECT_CREDENTIALS": "Wrong password",
  "core.SecondFactorEnrolment.error.SECOND_FACTOR_ALREADY_ENROLLED": "Already enrolled",
  "core.SecondFactorEnrolment.error.INVALID_SECOND_FACTOR": "Wrong code",
  "core.SecondFactorEnrolment.error.SECOND_FACTOR_THROTTLED": "Try again after {until}",
  "core.SecondFactorEnrolment.error.SECOND_FACTOR_THROTTLED_NO_TIME": "Too many attempts. Wait a little.",
  "core.SecondFactorEnrolment.error.SECOND_FACTOR_ENROLMENT_REQUIRED": "Interrupted",
  "core.RecoveryCodes.saved": "I have saved my recovery codes",
  "core.RecoveryCodes.continueBtn": "Continue",
};

const TOTP = {
  configUrl: "otpauth://totp/openIMIS:alice?secret=JBSWY3DPEHPK3PXP&issuer=openIMIS",
  secret: "JBSWY3DPEHPK3PXP",
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

const enrolled = () => ({ enrolSecondFactor: { success: true, method: "TOTP", totp: TOTP, error: null } });
const refusedEnrol = (error) => ({ enrolSecondFactor: { success: false, method: null, totp: null, error } });
const confirmed = () => ({ confirmSecondFactor: { success: true, codes: CODES, error: null, lockedUntil: null } });
const refusedConfirm = (error, lockedUntil = null) => ({
  confirmSecondFactor: { success: false, codes: null, error, lockedUntil },
});

const render = (props = {}) =>
  renderWithProviders(<SecondFactorEnrolment onFinished={() => {}} {...props} />, { messages });

const begin = async (user) => {
  await user.type(screen.getByLabelText(/username/i), "alice");
  await user.type(screen.getByLabelText(/^password/i), "s3cret");
  await user.click(screen.getByRole("button", { name: "Continue" }));
};
const confirmWith = async (user, code) => {
  await user.type(await screen.findByLabelText(/code from the app/i), code);
  await user.click(screen.getByRole("button", { name: "Confirm" }));
};

beforeEach(() => {
  sentOperations.length = 0;
  answers.enrolSecondFactor = vi.fn(async () => enrolled());
  answers.confirmSecondFactor = vi.fn(async () => confirmed());
  // TextInput leaks props onto the DOM, so React warns on every render.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("groupSecret", () => {
  it("splits a base32 key into groups of four for typing by hand", () => {
    expect(groupSecret("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
  });
});

describe("SecondFactorEnrolment", () => {
  it("begins with the password, then shows the QR code and the key to type", async () => {
    const user = userEvent.setup();
    render();

    await begin(user);

    expect(answers.enrolSecondFactor).toHaveBeenCalledWith({ username: "alice", password: "s3cret" });
    expect(await screen.findByTestId("secret")).toHaveTextContent("JBSW Y3DP EHPK 3PXP");
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("confirms with the code and shows the recovery codes once, behind an acknowledgement", async () => {
    const onFinished = vi.fn();
    const user = userEvent.setup();
    render({ onFinished });

    await begin(user);
    await confirmWith(user, "123456");

    expect(answers.confirmSecondFactor).toHaveBeenCalledWith({ username: "alice", password: "s3cret", otp: "123456" });
    for (const code of CODES) {
      expect(await screen.findByText(code)).toBeInTheDocument();
    }
    const cont = screen.getByRole("button", { name: "Continue" });
    expect(cont).toBeDisabled();
    await user.click(screen.getByRole("checkbox"));
    await user.click(cont);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("stays on the password step when the password is wrong", async () => {
    answers.enrolSecondFactor = vi.fn(async () => refusedEnrol("INCORRECT_CREDENTIALS"));
    const user = userEvent.setup();
    render();

    await begin(user);

    expect(await screen.findByText("Wrong password")).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("says so when the account already has an authenticator", async () => {
    answers.enrolSecondFactor = vi.fn(async () => refusedEnrol("SECOND_FACTOR_ALREADY_ENROLLED"));
    const user = userEvent.setup();
    render();

    await begin(user);

    expect(await screen.findByText("Already enrolled")).toBeInTheDocument();
  });

  it("shows the lockout wording as the server sent it", async () => {
    answers.enrolSecondFactor = vi.fn(async () => refusedEnrol("Too many failed attempts, try again in 5 minutes"));
    const user = userEvent.setup();
    render();

    await begin(user);

    expect(await screen.findByText("Too many failed attempts, try again in 5 minutes")).toBeInTheDocument();
  });

  it("keeps the QR code up when the confirming code is wrong", async () => {
    answers.confirmSecondFactor = vi.fn(async () => refusedConfirm("INVALID_SECOND_FACTOR"));
    const user = userEvent.setup();
    render();

    await begin(user);
    await confirmWith(user, "000000");

    expect(await screen.findByText("Wrong code")).toBeInTheDocument();
    expect(screen.getByTestId("secret")).toBeInTheDocument();
  });

  it("tells a backing-off device from a wrong code", async () => {
    answers.confirmSecondFactor = vi.fn(async () =>
      refusedConfirm("SECOND_FACTOR_THROTTLED", "2026-09-17T10:00:00+00:00"),
    );
    const user = userEvent.setup();
    render();

    await begin(user);
    await confirmWith(user, "000000");

    expect(await screen.findByText(/Try again after/)).toBeInTheDocument();
  });

  it("starts over when the pending device is gone", async () => {
    answers.confirmSecondFactor = vi.fn(async () => refusedConfirm("SECOND_FACTOR_ENROLMENT_REQUIRED"));
    const user = userEvent.setup();
    render();

    await begin(user);
    await confirmWith(user, "123456");

    expect(await screen.findByText("Interrupted")).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toHaveValue("");
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("never asks for the mutation log, which needs a session this page does not have", async () => {
    const user = userEvent.setup();
    render();

    await begin(user);
    await confirmWith(user, "123456");

    expect(sentOperations).toHaveLength(2);
    expect(sentOperations.some((op) => op.includes("mutationLogs"))).toBe(false);
  });

  it("says to wait, without a placeholder, when the server reports no lifting time", async () => {
    answers.confirmSecondFactor = vi.fn(async () => refusedConfirm("SECOND_FACTOR_THROTTLED", null));
    const user = userEvent.setup();
    render();

    await begin(user);
    await confirmWith(user, "000000");

    expect(await screen.findByText("Too many attempts. Wait a little.")).toBeInTheDocument();
    expect(screen.queryByText(/\{until\}/)).toBeNull();
  });

  it("keeps the footer off the recovery-codes step, so the acknowledgement cannot be skipped", async () => {
    const user = userEvent.setup();
    render({ footer: <button type="button">Back to login</button> });

    expect(screen.getByRole("button", { name: "Back to login" })).toBeInTheDocument();

    await begin(user);
    expect(screen.getByRole("button", { name: "Back to login" })).toBeInTheDocument();

    await confirmWith(user, "123456");
    expect(screen.queryByRole("button", { name: "Back to login" })).toBeNull();
  });

  it("prefills and locks the username when told to", () => {
    render({ initialUsername: "alice", usernameReadOnly: true });

    const username = screen.getByLabelText(/username/i);
    expect(username).toHaveValue("alice");
    expect(username).toBeDisabled();
  });
});
