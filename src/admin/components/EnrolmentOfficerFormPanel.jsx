import React, { useState, useEffect } from "react";

import { Grid, Typography, Paper, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useTranslations, withModulesManager, PublishedComponent, TextInput, useGraphqlQuery } from "@openimis/fe-core";
import { ENROLMENT_OFFICER_USER_TYPE, OFFICER_ROLE_IS_SYSTEM } from "../constants";
import { toggleUserRoles, toggleSwitchButton, setUserTypeEnabled } from "../utils";
import EnrolmentVillagesPicker from "./EnrolmentVillagesPicker";

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...(theme.paper?.paper ?? {}),
  "& .title": theme.paper?.title ?? {},
  "& .item": theme.paper?.item ?? {},
}));

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

  const handleToggle = () => {
    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    onEditedChanged(setUserTypeEnabled(edited, ENROLMENT_OFFICER_USER_TYPE, nextEnabled));
  };

  return (
    <StyledPaper>
      <Grid size={{ xs: 12 }} className="title">
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{formatMessage("title")}</Typography>
          {(edited || !isEnabled) && (
            <Switch color="secondary" disabled={readOnly} checked={isEnabled} onChange={handleToggle} />
          )}
        </Grid>
      </Grid>
      {isEnabled && (
        <Grid size={{ xs: 12 }}>
          <Grid container>
            <Grid size={{ xs: 4 }} className="item">
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited?.birthDate}
                module="admin"
                label="user.dob"
                readOnly={readOnly}
                maxDate={new Date()}
                onChange={(birthDate) => onEditedChanged({ ...edited, birthDate })}
              />
            </Grid>
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
          </Grid>
        </Grid>
      )}
    </StyledPaper>
  );
};

export { StyledPaper };
export default withModulesManager(EnrolmentOfficerFormPanel);
