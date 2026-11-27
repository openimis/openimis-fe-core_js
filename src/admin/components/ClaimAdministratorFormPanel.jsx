import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";

import { useTranslations, withModulesManager, PublishedComponent, useGraphqlQuery } from "@openimis/fe-core";
import { CLAIM_ADMIN_USER_TYPE, CLAIM_ADMIN_IS_SYSTEM } from "../constants";
import { toggleUserRoles, toggleSwitchButton, setUserTypeEnabled } from "../utils";
import UserTypeFormPanel, { StyledPaper } from "./UserTypeFormPanel";

const ClaimAdministratorFormPanel = (props) => {
  const { edited, modulesManager, onEditedChanged, readOnly } = props;
  const { formatMessage } = useTranslations("admin.ClaimAdministratorFormPanel", modulesManager);
  const hasClaimUserType = edited.userTypes?.includes(CLAIM_ADMIN_USER_TYPE);
  const hasClaimRole = edited.roles
    ? edited.roles.filter((x) => x.isSystem === CLAIM_ADMIN_IS_SYSTEM).length !== 0
    : false;
  const [isEnabled, setIsEnabled] = useState(false);
  const { isLoading, data } = useGraphqlQuery(
    `
    query UserRolesPicker ($system_id: Int) {
      role(systemRoleId: $system_id) {
        edges {
          node {
            id name isSystem
          }
        }
      }
    }
  `,
    { system_id: CLAIM_ADMIN_IS_SYSTEM },
  );
  const isValid = !isLoading;

  useEffect(() => {
    toggleUserRoles(edited, data, isValid, isEnabled, hasClaimRole, onEditedChanged, CLAIM_ADMIN_IS_SYSTEM);
  }, [isEnabled, isValid]);

  useEffect(() => {
    toggleSwitchButton(edited, hasClaimRole, hasClaimUserType, setIsEnabled);
  }, [hasClaimRole, hasClaimUserType]);

  // the panel is also enabled by the claim administrator role alone, but the backend only
  // creates or updates the claim administrator - and the form only requires its health
  // facility - when the user type is set
  useEffect(() => {
    if (isEnabled && !hasClaimUserType) {
      onEditedChanged(setUserTypeEnabled(edited, CLAIM_ADMIN_USER_TYPE, true));
    }
  }, [isEnabled, hasClaimUserType, edited, onEditedChanged]);

  const handleToggle = () => {
    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    onEditedChanged(setUserTypeEnabled(edited, CLAIM_ADMIN_USER_TYPE, nextEnabled));
  };

  return (
    <UserTypeFormPanel
      title={formatMessage("title")}
      edited={edited}
      isEnabled={isEnabled}
      readOnly={readOnly}
      onToggle={handleToggle}
      onEditedChanged={onEditedChanged}
    >
      <Grid size={{ xs: 4 }} className="item">
        <PublishedComponent
          pubRef="location.HealthFacilityPicker"
          value={edited?.healthFacility}
          district={edited?.districts}
          required
          module="admin"
          readOnly={readOnly}
          onChange={(healthFacility) => onEditedChanged({ ...edited, healthFacility })}
        />
      </Grid>
    </UserTypeFormPanel>
  );
};

export { StyledPaper };
export default withModulesManager(ClaimAdministratorFormPanel);
