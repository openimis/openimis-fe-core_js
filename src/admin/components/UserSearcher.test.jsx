import React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, mockModulesManager, screen } from "../../testing";
import { RIGHT_USER_DELETE } from "../constants";
import { UserSearcher } from "./UserSearcher";

// The fe-core barrel cannot be loaded from a test. Searcher is reduced to what
// UserSearcher hands it: one row per item, greyed by `rowDisabled` the way Table
// does it, with the cells its formatters return.
vi.mock("@openimis/fe-core", async () => {
  const ReactActual = (await import("react")).default;
  const h = ReactActual.createElement;
  return {
    withModulesManager: (Component) => Component,
    formatMessage: (intl, module, id) => id,
    formatMessageWithValues: (intl, module, id) => id,
    formatDateFromISO: (mm, intl, d) => d,
    decodeId: (id) => id,
    ConfirmDialog: () => null,
    ActionMenu: ({ actions }) =>
      h("div", null, actions.filter(Boolean).map((a) => h("button", { key: a.label, type: "button" }, a.label))),
    Searcher: ({ items, itemFormatters, rowDisabled }) =>
      h(
        "table",
        null,
        h(
          "tbody",
          null,
          items.map((item) =>
            h(
              "tr",
              { key: item.id, "data-testid": item.username, className: rowDisabled([], item) ? "tableDisabledRow" : "" },
              itemFormatters().map((format, idx) => h("td", { key: idx }, format(item))),
            ),
          ),
        ),
      ),
  };
});

const user = (username, active) => ({
  id: username,
  username,
  iUser: { id: `i-${username}`, lastName: username, otherNames: "", active },
});

function renderSearcher(users) {
  return renderWithProviders(
    <UserSearcher
      modulesManager={mockModulesManager()}
      intl={{}}
      rights={[RIGHT_USER_DELETE]}
      users={users}
      usersPageInfo={{ totalCount: users.length }}
      fetchedUserLocation
      userL0s={[]}
      fetchUsersSummaries={vi.fn()}
      deleteUser={vi.fn()}
      onDoubleClick={vi.fn()}
    />,
  );
}

const labels = (row) => [...row.querySelectorAll("button")].map((b) => b.textContent);

describe("UserSearcher", () => {
  // A deleted user is marked on its InteractiveUser (`active`), not on User (OP-3205).
  it("greys out a deleted user and offers no Delete on it", () => {
    renderSearcher([user("gone", false)]);
    const row = screen.getByTestId("gone");

    expect(row).toHaveClass("tableDisabledRow");
    expect(labels(row)).not.toContain("deleteUser.buttonText");
  });

  it("keeps a live user enabled and deletable", () => {
    renderSearcher([user("alive", true)]);
    const row = screen.getByTestId("alive");

    expect(row).not.toHaveClass("tableDisabledRow");
    expect(labels(row)).toContain("deleteUser.buttonText");
  });
});
