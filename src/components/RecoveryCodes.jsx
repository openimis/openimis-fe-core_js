import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Button, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";

const StyledCodes = styled("ul")(({ theme }) => ({
  columns: 2,
  listStyle: "none",
  padding: 0,
  margin: theme.spacing(1, 0),
  fontFamily: "monospace",
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.primary,
  "& li": { padding: theme.spacing(0.5, 0) },
}));

// A set is returned by the server exactly once, so the user has to say they
// kept it before they can leave the page.
const RecoveryCodes = ({ codes, onAcknowledged, children = null }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RecoveryCodes", modulesManager);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    // navigator.clipboard is undefined over plain http, which most local
    // instances are; a failed write must not claim "Copied".
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Grid container spacing={2} direction="column" alignItems="stretch">
      <Grid>
        <Typography variant="h6">{formatMessage("title")}</Typography>
      </Grid>
      <Grid>
        <Typography>{formatMessage("explanation")}</Typography>
      </Grid>
      <Grid>
        <StyledCodes>
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </StyledCodes>
        <Button onClick={copy}>{formatMessage(copied ? "copied" : "copy")}</Button>
      </Grid>
      {children}
      <Grid>
        <FormControlLabel
          control={<Checkbox checked={saved} onChange={(e) => setSaved(e.target.checked)} />}
          label={formatMessage("saved")}
        />
      </Grid>
      <Grid>
        <Button fullWidth color="primary" variant="contained" disabled={!saved} onClick={onAcknowledged}>
          {formatMessage("continueBtn")}
        </Button>
      </Grid>
    </Grid>
  );
};

export default RecoveryCodes;
