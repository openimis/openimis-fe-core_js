import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { act } from "@testing-library/react";

import { renderWithProviders, mockModulesManager } from "../../testing";
import { CLAIM_ADMIN_IS_SYSTEM, CLAIM_ADMIN_USER_TYPE, INTERACTIVE_USER_TYPE } from "../constants";
import ClaimAdministratorFormPanel from "./ClaimAdministratorFormPanel";

// The fe-core barrel cannot be loaded from a test. The panel only needs its
// translations, the role query (already answered) and the published pickers.
vi.mock("@openimis/fe-core", () => {
  const roleQuery = {
    isLoading: false,
    data: { role: { edges: [{ node: { id: "r-256", name: "Claim Administrator", isSystem: 256 } }] } },
  };
  return {
    withModulesManager: (Component) => Component,
    useTranslations: () => ({ formatMessage: (id) => id }),
    useGraphqlQuery: () => roleQuery,
    PublishedComponent: () => null,
  };
});

// Like UserForm, the parent keeps the edited user in its state and hands every
// change back to the panel; `onEditedChanged` records what the panel sends.
// The panel is mounted first, then the user is changed the way UserMasterPanel
// does it (e.g. picking a role), as on the user form.
function renderPanel(initialEdited) {
  const onEditedChanged = vi.fn();
  let setParentEdited;
  const Parent = () => {
    const [edited, setEdited] = useState(initialEdited);
    setParentEdited = setEdited;
    return (
      <ClaimAdministratorFormPanel
        modulesManager={mockModulesManager()}
        edited={edited}
        onEditedChanged={(user) => {
          onEditedChanged(user);
          setEdited(user);
        }}
      />
    );
  };
  renderWithProviders(<Parent />);
  const changeUser = (change) => {
    onEditedChanged.mockClear();
    act(() => setParentEdited((edited) => change(edited)));
  };
  return { onEditedChanged, changeUser };
}

const claimAdminRole = { id: "r-256", name: "Claim Administrator", isSystem: CLAIM_ADMIN_IS_SYSTEM };
const otherRole = { id: "r-1", name: "Receptionist", isSystem: 1 };
const sentUserTypes = (onEditedChanged) => onEditedChanged.mock.calls.map(([user]) => user.userTypes ?? []);

describe("ClaimAdministratorFormPanel", () => {
  it("adds the claim administrator user type when the role alone enables the panel", () => {
    const { onEditedChanged, changeUser } = renderPanel({ roles: [] });

    changeUser((edited) => ({ ...edited, roles: [claimAdminRole] }));

    expect(sentUserTypes(onEditedChanged).some((types) => types.includes(CLAIM_ADMIN_USER_TYPE))).toBe(true);
  });

  it("keeps the other user types when adding the claim administrator one", () => {
    const { onEditedChanged, changeUser } = renderPanel({ userTypes: [INTERACTIVE_USER_TYPE], roles: [] });

    changeUser((edited) => ({ ...edited, roles: [claimAdminRole] }));

    expect(onEditedChanged).toHaveBeenLastCalledWith(
      expect.objectContaining({ userTypes: [INTERACTIVE_USER_TYPE, CLAIM_ADMIN_USER_TYPE] }),
    );
  });

  it("does not add the user type for a role other than claim administrator", () => {
    const { onEditedChanged, changeUser } = renderPanel({ userTypes: [INTERACTIVE_USER_TYPE], roles: [] });

    changeUser((edited) => ({ ...edited, roles: [otherRole] }));

    expect(sentUserTypes(onEditedChanged).some((types) => types.includes(CLAIM_ADMIN_USER_TYPE))).toBe(false);
  });
});
