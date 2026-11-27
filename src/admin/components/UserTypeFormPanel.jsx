import React from "react";
import { Grid, Typography, Paper, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PublishedComponent } from "@openimis/fe-core";

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper,
  "& .title": theme.paper?.title ?? {},
  "& .item": theme.paper?.item ?? {},
}));

/*
 * The frame shared by the user-type panels of the user form (claim administrator,
 * enrolment officer): a title with the switch that enables the user type and, once
 * enabled, the birth date followed by the panel's own fields.
 */
const UserTypeFormPanel = ({ title, edited, isEnabled, readOnly, onToggle, onEditedChanged, children }) => (
  <StyledPaper>
    <Grid size={{ xs: 12 }} className="title">
      <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">{title}</Typography>
        {(edited || !isEnabled) && (
          <Switch color="secondary" disabled={readOnly} checked={isEnabled} onChange={onToggle} />
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
          {children}
        </Grid>
      </Grid>
    )}
  </StyledPaper>
);

export { StyledPaper };
export default UserTypeFormPanel;
