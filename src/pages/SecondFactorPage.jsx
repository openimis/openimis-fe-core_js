import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import TextInput from "../components/inputs/TextInput";
import ProgressOrError from "../components/generics/ProgressOrError";
import SecondFactorEnrolment from "../components/SecondFactorEnrolment";
import RecoveryCodes from "../components/RecoveryCodes";
import Helmet from "../helpers/Helmet";
import { Redirect } from "../helpers/history";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import { useGraphqlMutation, useGraphqlQuery } from "../helpers/hooks";
import { refusalMessage } from "../helpers/secondFactor";
import { DEFAULT } from "../constants";

// Page-local, not a field on useUserQuery: other modules render that hook,
// and a backend without hasSecondFactor would take their pages down.
const STATUS = `
  query secondFactorStatus {
    user {
      id
      hasSecondFactor
    }
  }
`;

const ISSUE = `
  mutation issueRecoveryCodes($input: IssueRecoveryCodesMutationInput!) {
    issueRecoveryCodes(input: $input) {
      clientMutationId
      codes
      success
      error
      lockedUntil
    }
  }
`;

const KNOWN_REFUSALS = [
  "SECOND_FACTOR_REQUIRED",
  "INVALID_SECOND_FACTOR",
  "SECOND_FACTOR_THROTTLED",
  "SECOND_FACTOR_ENROLMENT_REQUIRED",
];

const StyledSecondFactorPage = styled("div")(({ theme }) => ({
  margin: theme.spacing(2),
  "& .paper": theme.paper?.paper ?? {},
}));

const SecondFactorPage = () => {
  const modulesManager = useModulesManager();
  const translations = useTranslations("core.SecondFactorPage", modulesManager);
  const { formatMessage } = translations;
  const username = useSelector((state) => state.core.user?.username);
  const { data, isLoading, error, refetch } = useGraphqlQuery(STATUS);
  const issue = useGraphqlMutation(ISSUE, { wait: false });
  const [otp, setOtp] = useState("");
  const [codes, setCodes] = useState(null);
  const [issueError, setIssueError] = useState(null);

  const refusal = (code, lockedUntil) => refusalMessage(translations, KNOWN_REFUSALS, code, lockedUntil);

  const requestCodes = async (e) => {
    e.preventDefault();
    setIssueError(null);
    try {
      const result = await issue.mutate({ otp });
      const payload = result?.issueRecoveryCodes;
      if (payload?.success) {
        setCodes(payload.codes);
        setOtp("");
      } else {
        setIssueError(refusal(payload?.error ?? formatMessage("error.GENERAL"), payload?.lockedUntil));
      }
    } catch (err) {
      setIssueError(formatMessage("error.GENERAL"));
    }
  };

  // The route is registered unconditionally, so only the flag keeps this page
  // off a deployment whose backend has no second factor.
  if (!modulesManager.getConf("fe-core", "App.secondFactor", DEFAULT.SECOND_FACTOR)) {
    return <Redirect to="/" />;
  }
  if (isLoading || error) {
    return <ProgressOrError progress={isLoading} error={error} />;
  }
  const hasSecondFactor = data?.user?.hasSecondFactor;

  return (
    <StyledSecondFactorPage>
      <Helmet title={formatMessage("pageTitle")} />
      <Paper className="paper">
        <Box p={3} maxWidth={600}>
          {!hasSecondFactor && (
            <SecondFactorEnrolment initialUsername={username} usernameReadOnly onFinished={refetch} />
          )}
          {hasSecondFactor && codes && <RecoveryCodes codes={codes} onAcknowledged={() => setCodes(null)} />}
          {hasSecondFactor && !codes && (
            <form onSubmit={requestCodes}>
              <Grid container spacing={2} direction="column" alignItems="stretch">
                <Grid>
                  <Typography variant="h6">{formatMessage("enrolledTitle")}</Typography>
                </Grid>
                <Grid>
                  <Typography>{formatMessage("enrolledExplanation")}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="subtitle1">{formatMessage("recoveryTitle")}</Typography>
                </Grid>
                <Grid>
                  <Typography>{formatMessage("recoveryExplanation")}</Typography>
                </Grid>
                <Grid>
                  <TextInput
                    required
                    readOnly={issue.isLoading}
                    module="core.SecondFactorPage"
                    label="code.label"
                    fullWidth
                    inputProps={{ autoComplete: "one-time-code" }}
                    value={otp}
                    onChange={setOtp}
                  />
                </Grid>
                {issueError && (
                  <Grid>
                    <Box color="error.main">{issueError}</Box>
                  </Grid>
                )}
                <Grid>
                  <Button type="submit" color="primary" variant="contained" disabled={issue.isLoading || !otp}>
                    {formatMessage("issueBtn")}
                  </Button>
                </Grid>
                <Grid>
                  <Typography variant="body2">{formatMessage("lostDevice")}</Typography>
                </Grid>
              </Grid>
            </form>
          )}
        </Box>
      </Paper>
    </StyledSecondFactorPage>
  );
};

export default SecondFactorPage;
