import React, { useState, useEffect } from "react";

import { Grid } from "@mui/material";

import { useTranslations, withModulesManager, PublishedComponent, TextInput, useGraphqlQuery } from "@openimis/fe-core";
import { ENROLMENT_OFFICER_USER_TYPE, OFFICER_ROLE_IS_SYSTEM } from "../constants";
import { toggleUserRoles, toggleSwitchButton, setUserTypeEnabled } from "../utils";
import UserTypeFormPanel, { StyledPaper } from "./UserTypeFormPanel";
import EnrolmentVillagesPicker from "./EnrolmentVillagesPicker";

const EnrolmentOfficerFormPanel = (props) => {
  const { edited, modulesManager, onEditedChanged, readOnly } = props;
  const { formatMessage } = useTranslations("admin.EnrolmentOfficerFormPanel", modulesManager);
  const [isEnabled, setIsEnabled] = useState(false);

  const hasOfficerUserType = edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE);
  const hasOfficerRole = edited.roles
    ? edited.roles.filter((x) => x.isSystem === OFFICER_ROLE_IS_SYSTEM).length !== 0
    : false;

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
    { system_id: OFFICER_ROLE_IS_SYSTEM },
  );

  const isValid = !isLoading;
  useEffect(() => {
    toggleUserRoles(edited, data, isValid, isEnabled, hasOfficerRole, onEditedChanged, OFFICER_ROLE_IS_SYSTEM);
  }, [isEnabled, isValid]);

  useEffect(() => {
    toggleSwitchButton(edited, hasOfficerRole, hasOfficerUserType, setIsEnabled);
  }, [hasOfficerRole, hasOfficerUserType]);

  // the panel is also enabled by the enrolment officer role alone, but the backend only
  // creates or updates the officer - and hence its villages - when the user type is set
  useEffect(() => {
    if (isEnabled && !hasOfficerUserType) {
      onEditedChanged(setUserTypeEnabled(edited, ENROLMENT_OFFICER_USER_TYPE, true));
    }
  }, [isEnabled, hasOfficerUserType]);

  const handleToggle = () => {
    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    onEditedChanged(setUserTypeEnabled(edited, ENROLMENT_OFFICER_USER_TYPE, nextEnabled));
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
          pubRef="admin.SubstitutionEnrolmentOfficerPicker"
          module="admin"
          readOnly={readOnly}
          withLabel
          withPlaceholder
          value={edited.substitutionOfficer}
          villages={edited.officerVillages}
          onChange={(substitutionOfficer) => onEditedChanged({ ...edited, substitutionOfficer })}
        />
      </Grid>
      <Grid size={{ xs: 4 }} className="item">
        <PublishedComponent
          pubRef="core.DatePicker"
          value={edited?.worksTo ?? ""}
          module="admin"
          label="user.worksTo"
          readOnly={readOnly}
          onChange={(worksTo) => onEditedChanged({ ...edited, worksTo })}
        />
      </Grid>
      <Grid size={{ xs: 12 }} className="item">
        <TextInput
          module="admin"
          label="user.address"
          multiline
          rows={2}
          variant="outlined"
          readOnly={readOnly}
          value={edited?.address ?? ""}
          onChange={(address) => onEditedChanged({ ...edited, address })}
        />
      </Grid>
      <Grid size={{ xs: 12 }} className="item">
        <EnrolmentVillagesPicker
          isOfficerPanelEnabled={isEnabled}
          readOnly={readOnly}
          districts={edited.districts}
          villages={edited.officerVillages}
          onChange={(officerVillages) => onEditedChanged({ ...edited, officerVillages })}
        />
      </Grid>
    </UserTypeFormPanel>
  );
};

export { StyledPaper };
export default withModulesManager(EnrolmentOfficerFormPanel);
