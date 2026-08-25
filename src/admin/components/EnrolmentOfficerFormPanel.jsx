import React, { useEffect } from "react";

import { Grid, Typography, Paper, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useTranslations, withModulesManager, PublishedComponent, TextInput, useGraphqlQuery } from "@openimis/fe-core";
import { ENROLMENT_OFFICER_USER_TYPE, OFFICER_ROLE_IS_SYSTEM } from "../constants";
import { setUserTypeEnabled } from "../utils";
import EnrolmentVillagesPicker from "./EnrolmentVillagesPicker";

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...(theme.paper?.paper ?? {}),
  "& .title": theme.paper?.title ?? {},
  "& .item": theme.paper?.item ?? {},
}));

const EnrolmentOfficerFormPanel = (props) => {
  const { edited, modulesManager, onEditedChanged, readOnly } = props;
  const { formatMessage } = useTranslations("admin.EnrolmentOfficerFormPanel", modulesManager);

  const hasOfficerUserType = edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE);
  const hasOfficerRole = edited.roles ? edited.roles.some((x) => x.isSystem === OFFICER_ROLE_IS_SYSTEM) : false;
  const isEnabled = hasOfficerRole || hasOfficerUserType;

  const { data } = useGraphqlQuery(
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

  // Ensure the system role is present whenever the EO panel is enabled
  useEffect(() => {
    if (isEnabled && !hasOfficerRole) {
      const role = data?.role?.edges?.[0]?.node;
      if (role) {
        const roles = edited.roles ? [...edited.roles] : [];
        if (!roles.some((r) => r.isSystem === OFFICER_ROLE_IS_SYSTEM)) {
          onEditedChanged({ ...edited, roles: [...roles, role] });
        }
      }
    }
  }, [data, isEnabled, hasOfficerRole]);

  const handleToggle = () => {
    const nextEnabled = !isEnabled;
    let newEdited = setUserTypeEnabled(edited, ENROLMENT_OFFICER_USER_TYPE, nextEnabled);
    if (nextEnabled && !hasOfficerRole) {
      const role = data?.role?.edges?.[0]?.node;
      if (role) {
        const roles = newEdited.roles ? [...newEdited.roles] : [];
        if (!roles.some((r) => r.isSystem === OFFICER_ROLE_IS_SYSTEM)) {
          roles.push(role);
          newEdited = { ...newEdited, roles };
        }
      }
    } else if (!nextEnabled) {
      newEdited = {
        ...newEdited,
        roles: (newEdited.roles || []).filter((r) => r.isSystem !== OFFICER_ROLE_IS_SYSTEM),
      };
    }
    onEditedChanged(newEdited);
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
