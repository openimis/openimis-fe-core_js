import React from "react";
import { describe, expect, it, vi } from "vitest";

// UserPicker imports from the fe-core barrel, which cannot be loaded on its own
// from a test (UserPicker -> withModulesManager cycle). Stub what it reaches.
vi.mock("@openimis/fe-core", async () => {
  const ReactActual = (await import("react")).default;
  const { mockModulesManager } = await import("../../../testing");
  return {
    withModulesManager: (Component) =>
      function WithModulesManager(props) {
        return ReactActual.createElement(Component, { ...props, modulesManager: mockModulesManager() });
      },
    // No debounce: the search fires on the next render.
    useDebounceCb: (cb) => cb,
    useTranslations: () => ({ formatMessage: (key) => key }),
  };
});

const fetchUsers = vi.fn(() => ({ type: "TEST_FETCH_USERS" }));
vi.mock("../../actions", () => ({ fetchUsers: (...args) => fetchUsers(...args) }));

const { default: UserPicker } = await import("./UserPicker");
const { renderWithProviders, makeStore, screen, userEvent } = await import("../../../testing");

const user = (username) => ({ id: username, username, iUser: null });

const renderPicker = (items = []) => {
  const store = makeStore({
    reducers: { admin: (state = { users: { items, isLoading: false } }) => state },
  });
  return renderWithProviders(<UserPicker onChange={() => {}} />, { store });
};

const ORDER_BY_USERNAME = 'orderBy: ["username"]';

describe("UserPicker", () => {
  // OP-3245: without an order, `first: 10` is an arbitrary slice that can leave
  // out Admin.
  it("orders the users by login name when the list opens", async () => {
    renderPicker();

    await userEvent.click(screen.getByRole("combobox"));

    expect(fetchUsers).toHaveBeenCalled();
    const [, filters] = fetchUsers.mock.calls.at(-1);
    expect(filters).toContain(ORDER_BY_USERNAME);
  });

  it("orders the users by login name when searching", async () => {
    renderPicker();

    await userEvent.type(screen.getByRole("combobox"), "Adm");

    const searches = fetchUsers.mock.calls.filter(([, filters]) => filters.includes('str: "Adm"'));
    expect(searches).not.toHaveLength(0);
    expect(searches.at(-1)[1]).toContain(ORDER_BY_USERNAME);
  });

  // OP-3245: the server does the matching. Filtering the loaded page in the
  // browser first empties the list until the search answers.
  it("keeps the loaded users listed while the search is pending", async () => {
    renderPicker([user("BLCA01"), user("BLEO01")]);

    await userEvent.type(screen.getByRole("combobox"), "Adm");

    expect(screen.queryByText("No options")).toBeNull();
    expect(screen.getByRole("option", { name: "BLCA01" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "BLEO01" })).toBeInTheDocument();
  });
});
