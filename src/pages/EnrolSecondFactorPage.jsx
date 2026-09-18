import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { Redirect, useHistory, useLocation } from "../helpers/history";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import Helmet from "../helpers/Helmet";
import SecondFactorEnrolment from "../components/SecondFactorEnrolment";
import { DEFAULT } from "../constants";

const StyledEnrolSecondFactorPage = styled("div")(({ theme }) => ({
  "& .container": {
    position: "absolute",
    top: "10%",
    left: 0,
    right: 0,
    margin: "auto",
    display: "flex",
    justifyContent: "center",
  },
  "& .paper": theme.paper?.paper ?? {},
}));

// Reached without a session, from the login's SECOND_FACTOR_ENROLMENT_REQUIRED.
const EnrolSecondFactorPage = () => {
  const history = useHistory();
  const location = useLocation();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.EnrolSecondFactorPage", modulesManager);
  const username = location.state?.username ?? "";

  if (!modulesManager.getConf("fe-core", "App.secondFactor", DEFAULT.SECOND_FACTOR)) {
    return <Redirect to="/login" />;
  }

  const backToLogin = () => history.push({ pathname: "/login", state: { username } });

  return (
    <StyledEnrolSecondFactorPage>
      <div className="container">
        <Helmet title={formatMessage("pageTitle")} />
        <Paper className="paper" elevation={2}>
          <Box p={3} width={500}>
            <SecondFactorEnrolment
              initialUsername={username}
              onFinished={backToLogin}
              codesNote={
                <Grid>
                  <Typography>{formatMessage("nextCodeHint")}</Typography>
                </Grid>
              }
              footer={
                <Box mt={2}>
                  <Button onClick={backToLogin}>{formatMessage("backToLogin")}</Button>
                </Box>
              }
            />
          </Box>
        </Paper>
      </div>
    </StyledEnrolSecondFactorPage>
  );
};

export default EnrolSecondFactorPage;
