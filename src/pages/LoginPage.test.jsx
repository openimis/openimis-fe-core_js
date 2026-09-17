import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "react-router-dom";

// The page logs in through useAuthentication, which dispatches this thunk;
// scripting its answer stands in for the whole backend.
const { loginResult } = vi.hoisted(() => ({ loginResult: vi.fn() }));
vi.mock("../actions", async () => ({
  ...(await vi.importActual("../actions")),
  login: (credentials) => async () => loginResult(credentials),
}));

import LoginPage from "./LoginPage";
import { mockModulesManager, renderWithProviders, screen, userEvent, waitFor } from "../testing";

const messages = {
  "core.LoginPage.username.label": "Username",
  "core.LoginPage.password.label": "Password",
  "core.LoginPage.loginBtn": "Log In",
  "core.LoginPage.secondFactor.code.label": "Verification code",
  "core.LoginPage.secondFactor.otherAccount": "Use a different account",
  "core.LoginPage.secondFactor.invalid": "The code is not valid.",
  "core.LoginPage.secondFactor.throttled": "Too many attempts. Try again after {until}.",
  "core.LoginPage.secondFactor.enrolmentRequired": "Your account requires two-factor authentication.",
  "core.LoginPage.secondFactor.enrolBtn": "Set up an authenticator",
};

const withFlag = (secondFactor) =>
  mockModulesManager({
    getConf: (module, key, defaultValue) => (key === "App.secondFactor" ? secondFactor : defaultValue),
  });

const renderLogin = ({ secondFactor = false, extra = null, route = "/login" } = {}) =>
  renderWithProviders(
    <>
      <LoginPage logo="" />
      {extra}
    </>,
    { messages, route, modulesManager: withFlag(secondFactor) },
  );

const refused = (message, extensions = {}) => ({
  loginStatus: "CORE_AUTH_ERR",
  message,
  extensions: { code: message, ...extensions },
});
const loggedIn = { loginStatus: "CORE_USERS_CURRENT_USER_RESP", message: "" };

const typeCredentials = async (user) => {
  await user.type(screen.getByLabelText(/username/i), "alice");
  await user.type(screen.getByLabelText(/^password/i), "s3cret");
};
const submit = (user) => user.click(screen.getByRole("button", { name: "Log In" }));
const codeField = () => screen.queryByLabelText(/verification code/i);

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  loginResult.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("LoginPage with the second factor disabled (the default)", () => {
  it("renders no code field", () => {
    renderLogin();

    expect(codeField()).toBeNull();
  });

  it("shows a SECOND_FACTOR_REQUIRED refusal as the raw code, as it always has, and still asks for none", async () => {
    loginResult.mockResolvedValue(refused("SECOND_FACTOR_REQUIRED"));
    const user = userEvent.setup();
    renderLogin();

    await typeCredentials(user);
    await submit(user);

    expect(await screen.findByText("SECOND_FACTOR_REQUIRED")).toBeInTheDocument();
    expect(codeField()).toBeNull();
    expect(loginResult).toHaveBeenCalledTimes(1);
    expect(loginResult).toHaveBeenCalledWith({ username: "alice", password: "s3cret" });
  });

  it("shows SECOND_FACTOR_ENROLMENT_REQUIRED the same way, with no enrolment button", async () => {
    loginResult.mockResolvedValue(refused("SECOND_FACTOR_ENROLMENT_REQUIRED"));
    const user = userEvent.setup();
    renderLogin();

    await typeCredentials(user);
    await submit(user);

    expect(await screen.findByText("SECOND_FACTOR_ENROLMENT_REQUIRED")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set up an authenticator" })).toBeNull();
  });
});

describe("LoginPage with the second factor enabled", () => {
  it("asks for a code when the password alone is refused, then resubmits the same credentials with it", async () => {
    loginResult.mockResolvedValueOnce(refused("SECOND_FACTOR_REQUIRED")).mockResolvedValueOnce(loggedIn);
    const user = userEvent.setup();
    renderLogin({ secondFactor: true });

    await typeCredentials(user);
    await submit(user);

    const field = await screen.findByLabelText(/verification code/i);
    expect(screen.queryByText("SECOND_FACTOR_REQUIRED")).toBeNull();
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Log In" })).toBeDisabled();

    await user.type(field, "123456");
    await submit(user);

    await waitFor(() =>
      expect(loginResult).toHaveBeenLastCalledWith({ username: "alice", password: "s3cret", otp: "123456" }),
    );
  });

  it("tells a wrong code from a wrong password and keeps the field", async () => {
    loginResult
      .mockResolvedValueOnce(refused("SECOND_FACTOR_REQUIRED"))
      .mockResolvedValueOnce(refused("INVALID_SECOND_FACTOR"));
    const user = userEvent.setup();
    renderLogin({ secondFactor: true });

    await typeCredentials(user);
    await submit(user);
    await user.type(await screen.findByLabelText(/verification code/i), "000000");
    await submit(user);

    expect(await screen.findByText("The code is not valid.")).toBeInTheDocument();
    expect(codeField()).not.toBeNull();
  });

  it("says when to try again on a throttled device", async () => {
    loginResult
      .mockResolvedValueOnce(refused("SECOND_FACTOR_REQUIRED"))
      .mockResolvedValueOnce(refused("SECOND_FACTOR_THROTTLED", { lockedUntil: "2026-09-17T10:00:00+00:00" }));
    const user = userEvent.setup();
    renderLogin({ secondFactor: true });

    await typeCredentials(user);
    await submit(user);
    await user.type(await screen.findByLabelText(/verification code/i), "000000");
    await submit(user);

    expect(await screen.findByText(/Try again after/)).toBeInTheDocument();
  });

  it("lets the user start over with another account", async () => {
    loginResult.mockResolvedValue(refused("SECOND_FACTOR_REQUIRED"));
    const user = userEvent.setup();
    renderLogin({ secondFactor: true });

    await typeCredentials(user);
    await submit(user);
    await user.click(await screen.findByRole("button", { name: "Use a different account" }));

    expect(codeField()).toBeNull();
    expect(screen.getByLabelText(/username/i)).not.toBeDisabled();
  });

  it("sends a bound user with no device to enrolment, carrying the username", async () => {
    loginResult.mockResolvedValue(refused("SECOND_FACTOR_ENROLMENT_REQUIRED"));
    const user = userEvent.setup();
    renderLogin({
      secondFactor: true,
      extra: (
        <Route
          path="/second_factor/enrol"
          render={({ location }) => <div>enrolment for {location.state?.username}</div>}
        />
      ),
    });

    await typeCredentials(user);
    await submit(user);
    await user.click(await screen.findByRole("button", { name: "Set up an authenticator" }));

    expect(await screen.findByText("enrolment for alice")).toBeInTheDocument();
    expect(screen.queryByText("SECOND_FACTOR_ENROLMENT_REQUIRED")).toBeNull();
  });

  it("prefills the username the enrolment page hands back", () => {
    renderLogin({ secondFactor: true, route: { pathname: "/login", state: { username: "alice" } } });

    expect(screen.getByLabelText(/username/i)).toHaveValue("alice");
  });
});
