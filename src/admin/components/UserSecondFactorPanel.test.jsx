import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { answers, fetchUser } = vi.hoisted(() => ({ answers: {}, fetchUser: vi.fn() }));
vi.mock("../../helpers/hooks", async () => ({
  ...(await vi.importActual("../../helpers/hooks")),
  useGraphqlMutation: (operation) => {
    const name = operation.match(/mutation (\w+)/)[1];
    return { isLoading: false, error: null, mutate: (input) => answers[name](input) };
  },
}));
vi.mock("../actions", async () => ({
  ...(await vi.importActual("../actions")),
  fetchUser,
}));

import UserSecondFactorPanel from "./UserSecondFactorPanel";
import { RIGHT_USERS, RIGHT_USER_RESET_SECOND_FACTOR } from "../constants";
import {
  globalId,
  makeStore,
  mockModulesManager,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "../../testing";

const messages = {
  "admin.UserSecondFactorPanel.title": "Two-factor authentication",
  "admin.UserSecondFactorPanel.enrolled": "An authenticator app is set up for this user",
  "admin.UserSecondFactorPanel.notEnrolled": "No authenticator app is set up for this user",
  "admin.UserSecondFactorPanel.resetBtn": "Reset second factor",
  "admin.UserSecondFactorPanel.resetDialog.title": "Reset this user's second factor?",
  "admin.UserSecondFactorPanel.resetDialog.message":
    "Their authenticator app and recovery codes stop working, and they are signed out everywhere. If two-factor " +
    "authentication is optional for them, they log in with their password alone and can set up an authenticator " +
    "again. If their role requires it, they are refused until they set one up.",
  "admin.UserSecondFactorPanel.reset.mutationLabel": "Reset second factor of {username}",
  "admin.UserSecondFactorPanel.error": "The reset could not be confirmed. The journal shows what happened.",
  "core.ok": "OK",
  "core.cancel": "Cancel",
};

const USER_UUID = "3f2b6a3e-0c9d-4b7e-9c1a-1d2e3f4a5b6c";
const USER_ID = globalId("UserGQLType", USER_UUID);

const withFlag = (secondFactor) =>
  mockModulesManager({
    getConf: (module, key, defaultValue) => (key === "App.secondFactor" ? secondFactor : defaultValue),
  });

const render = ({
  hasSecondFactor = true,
  rights = [RIGHT_USERS, RIGHT_USER_RESET_SECOND_FACTOR],
  secondFactor = true,
  ...rest
} = {}) => {
  const store = makeStore({ preloadedState: { core: { user: { i_user: { rights } } } } });
  const edited = {
    id: USER_ID,
    username: "alice",
    iUser: { id: "SW50ZXJhY3RpdmVVc2VyR1FMVHlwZTox" },
    hasSecondFactor,
    ...rest,
  };
  return renderWithProviders(<UserSecondFactorPanel edited={edited} />, {
    store,
    messages,
    modulesManager: withFlag(secondFactor),
  });
};

beforeEach(() => {
  answers.resetUserSecondFactor = vi.fn(async () => ({ status: 2, clientMutationId: "x", error: null }));
  fetchUser.mockImplementation(() => ({ type: "TEST_FETCH_USER" }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("UserSecondFactorPanel", () => {
  it("renders nothing while the second factor is disabled", () => {
    render({ secondFactor: false });

    expect(screen.queryByText("Two-factor authentication")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset second factor" })).toBeNull();
  });

  it("says the user has no authenticator and offers no reset", () => {
    render({ hasSecondFactor: false });

    expect(screen.getByText("No authenticator app is set up for this user")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset second factor" })).toBeNull();
  });

  it("shows the status but no reset to a caller without the right", () => {
    render({ rights: [RIGHT_USERS] });

    expect(screen.getByText("An authenticator app is set up for this user")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset second factor" })).toBeNull();
  });

  it("offers no reset on a deleted user, whose form is locked", () => {
    render({ validityTo: "2026-09-01T00:00:00" });

    expect(screen.getByText("An authenticator app is set up for this user")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset second factor" })).toBeNull();
  });

  it("offers no reset while another mutation on the user is still in flight", () => {
    render({ clientMutationId: "7f1c0a2e-0000-4000-8000-000000000000" });

    expect(screen.getByText("An authenticator app is set up for this user")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset second factor" })).toBeNull();
  });

  it("asks for confirmation and sends nothing when it is declined", async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole("button", { name: "Reset second factor" }));
    expect(screen.getByText("Reset this user's second factor?")).toBeInTheDocument();
    // The consequences are the whole point of confirming: an administrator who is
    // not told them cannot weigh the one action a password reset cannot undo.
    const consequences = screen.getByText(/recovery codes stop working/);
    expect(consequences).toHaveTextContent("signed out everywhere");
    expect(consequences).toHaveTextContent("optional for them");
    expect(consequences).toHaveTextContent("refused until they set one up");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(answers.resetUserSecondFactor).not.toHaveBeenCalled();
    expect(fetchUser).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Reset this user's second factor?")).toBeNull());
  });

  it("resets the user once confirmed, labelled for the journal, and re-reads the user", async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole("button", { name: "Reset second factor" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(answers.resetUserSecondFactor).toHaveBeenCalledWith({
      uuid: USER_UUID,
      clientMutationLabel: "Reset second factor of alice",
    });
    await waitFor(() => expect(fetchUser).toHaveBeenCalledWith(expect.anything(), USER_ID));
  });

  it("re-reads the user and says so when the server refuses", async () => {
    answers.resetUserSecondFactor = vi.fn(async () => {
      throw new Error("unauthorized");
    });
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole("button", { name: "Reset second factor" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(
      await screen.findByText("The reset could not be confirmed. The journal shows what happened."),
    ).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith(expect.anything(), USER_ID);
  });

  it.each([
    ["the mutation log poll gave up", { status: 0, clientMutationId: "x", error: null }],
    ["the mutation log could not be read", null],
  ])("says so rather than nothing when %s", async (_label, outcome) => {
    answers.resetUserSecondFactor = vi.fn(async () => outcome);
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole("button", { name: "Reset second factor" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(
      await screen.findByText("The reset could not be confirmed. The journal shows what happened."),
    ).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith(expect.anything(), USER_ID);
  });
});
