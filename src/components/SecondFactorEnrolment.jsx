import React, { useState } from "react";
import { useDispatch } from "react-redux";
import uuid from "lodash-uuid";
import { styled } from "@mui/material/styles";
import { Box, Button, Grid, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import TextInput from "./inputs/TextInput";
import RecoveryCodes from "./RecoveryCodes";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";
import { graphqlWithVariables } from "../actions";

const ENROL = `
  mutation enrolSecondFactor($input: EnrolSecondFactorMutationInput!) {
    enrolSecondFactor(input: $input) {
      clientMutationId
      method
      totp {
        configUrl
        secret
      }
      success
      error
    }
  }
`;

const CONFIRM = `
  mutation confirmSecondFactor($input: ConfirmSecondFactorMutationInput!) {
    confirmSecondFactor(input: $input) {
      clientMutationId
      codes
      success
      error
      lockedUntil
    }
  }
`;

const STEP = { CREDENTIALS: "credentials", CONFIRM: "confirm", CODES: "codes" };

// The codes the server names; anything else in `error` is its own wording
// (an empty field, the address lockout) and is shown as sent.
const KNOWN_REFUSALS = [
  "INCORRECT_CREDENTIALS",
  "SECOND_FACTOR_ALREADY_ENROLLED",
  "SECOND_FACTOR_REQUIRED",
  "INVALID_SECOND_FACTOR",
  "SECOND_FACTOR_THROTTLED",
  "SECOND_FACTOR_ENROLMENT_REQUIRED",
];

// A base32 key reads better in groups of four when typed into an app by hand.
export const groupSecret = (secret) => secret.match(/.{1,4}/g).join(" ");

// Not useGraphqlMutation: that helper follows every mutation with a
// mutationLogs query, which requires a session and so answers 401 on this
// page - the app reads that as an expired session and offers to log out a
// visitor who was never logged in. Neither mutation writes a log row anyway.
const useEnrolmentMutation = (operation) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);

  const mutate = async (input) => {
    setLoading(true);
    try {
      const action = await dispatch(
        graphqlWithVariables(operation, { input: { ...input, clientMutationId: uuid.uuid() } }, "CORE_SECOND_FACTOR"),
      );
      return action?.payload?.data;
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, mutate };
};

const StyledEnrolment = styled("div")(({ theme }) => ({
  "& .qr": { display: "flex", justifyContent: "center", padding: theme.spacing(2) },
  "& .secret": { fontFamily: "monospace", letterSpacing: "0.1em", color: theme.palette.text.primary },
}));

// Password -> scan -> confirm -> recovery codes, over the two password-
// authenticated mutations. Used before a session exists (a bound user refused
// at login) and from the profile (opting in), which is why it takes no user
// from the store: the server wants the password either way.
const SecondFactorEnrolment = ({
  initialUsername = "",
  usernameReadOnly = false,
  onFinished,
  children = null,
  footer = null,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useTranslations(
    "core.SecondFactorEnrolment",
    modulesManager,
  );
  const [step, setStep] = useState(STEP.CREDENTIALS);
  const [credentials, setCredentials] = useState({ username: initialUsername, password: "" });
  const [otp, setOtp] = useState("");
  const [totp, setTotp] = useState(null);
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState(null);
  const enrol = useEnrolmentMutation(ENROL);
  const confirm = useEnrolmentMutation(CONFIRM);
  const isLoading = enrol.isLoading || confirm.isLoading;

  const refusal = (code, lockedUntil) => {
    if (code === "SECOND_FACTOR_THROTTLED") {
      // The server sends no lifting time when the device does not report one,
      // and the dated wording carries an {until} placeholder that would
      // otherwise reach the user verbatim.
      return lockedUntil
        ? formatMessageWithValues("error.SECOND_FACTOR_THROTTLED", { until: formatDateTimeFromISO(lockedUntil) })
        : formatMessage("error.SECOND_FACTOR_THROTTLED_NO_TIME");
    }
    return KNOWN_REFUSALS.includes(code) ? formatMessage(`error.${code}`) : code;
  };

  const startOver = (message = null) => {
    setStep(STEP.CREDENTIALS);
    setTotp(null);
    setOtp("");
    setCredentials({ ...credentials, password: "" });
    setError(message);
  };

  const begin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await enrol.mutate({ username: credentials.username, password: credentials.password });
      const payload = result?.enrolSecondFactor;
      if (payload?.success) {
        setTotp(payload.totp);
        setStep(STEP.CONFIRM);
      } else {
        setError(refusal(payload?.error ?? formatMessage("error.GENERAL")));
      }
    } catch (err) {
      setError(formatMessage("error.GENERAL"));
    }
  };

  const complete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await confirm.mutate({ ...credentials, otp });
      const payload = result?.confirmSecondFactor;
      if (payload?.success) {
        setCodes(payload.codes);
        setStep(STEP.CODES);
      } else if (payload?.error === "SECOND_FACTOR_ENROLMENT_REQUIRED") {
        // Nothing is pending any more - enrolment was begun again elsewhere.
        startOver(refusal(payload.error));
      } else {
        setError(refusal(payload?.error ?? formatMessage("error.GENERAL"), payload?.lockedUntil));
      }
    } catch (err) {
      setError(formatMessage("error.GENERAL"));
    }
  };

  return (
    <StyledEnrolment>
      {step === STEP.CREDENTIALS && (
        <form onSubmit={begin}>
          <Grid container spacing={2} direction="column" alignItems="stretch">
            <Grid>
              <Typography variant="h6">{formatMessage("title")}</Typography>
            </Grid>
            <Grid>
              <Typography>{formatMessage("explanation")}</Typography>
            </Grid>
            <Grid>
              <TextInput
                required
                readOnly={isLoading || usernameReadOnly}
                module="core.SecondFactorEnrolment"
                label="username.label"
                fullWidth
                value={credentials.username}
                onChange={(username) => setCredentials({ ...credentials, username })}
              />
            </Grid>
            <Grid>
              <TextInput
                required
                readOnly={isLoading}
                type="password"
                module="core.SecondFactorEnrolment"
                label="password.label"
                fullWidth
                value={credentials.password}
                onChange={(password) => setCredentials({ ...credentials, password })}
              />
            </Grid>
            {error && (
              <Grid>
                <Box color="error.main">{error}</Box>
              </Grid>
            )}
            <Grid>
              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="contained"
                disabled={isLoading || !(credentials.username && credentials.password)}
              >
                {formatMessage("beginBtn")}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
      {step === STEP.CONFIRM && (
        <form onSubmit={complete}>
          <Grid container spacing={2} direction="column" alignItems="stretch">
            <Grid>
              <Typography variant="h6">{formatMessage("scanTitle")}</Typography>
            </Grid>
            <Grid>
              <Typography>{formatMessage("scanExplanation")}</Typography>
            </Grid>
            <Grid>
              <div className="qr">
                <QRCodeSVG value={totp.configUrl} size={192} />
              </div>
              <Typography variant="body2">{formatMessage("manualEntry")}</Typography>
              <Typography className="secret" data-testid="secret">
                {groupSecret(totp.secret)}
              </Typography>
            </Grid>
            <Grid>
              <TextInput
                required
                autoFocus
                readOnly={isLoading}
                module="core.SecondFactorEnrolment"
                label="code.label"
                fullWidth
                inputProps={{ autoComplete: "one-time-code", inputMode: "numeric" }}
                value={otp}
                onChange={setOtp}
              />
            </Grid>
            {error && (
              <Grid>
                <Box color="error.main">{error}</Box>
              </Grid>
            )}
            <Grid>
              <Button fullWidth type="submit" color="primary" variant="contained" disabled={isLoading || !otp}>
                {formatMessage("confirmBtn")}
              </Button>
            </Grid>
            <Grid>
              <Button onClick={() => startOver()}>{formatMessage("startOverBtn")}</Button>
            </Grid>
          </Grid>
        </form>
      )}
      {step === STEP.CODES && (
        <RecoveryCodes codes={codes} onAcknowledged={onFinished}>
          {children}
        </RecoveryCodes>
      )}
      {/* Never beside the codes: they are shown once, and a way off the page
          that skips the acknowledgement loses them. */}
      {step !== STEP.CODES && footer}
    </StyledEnrolment>
  );
};

export default SecondFactorEnrolment;
