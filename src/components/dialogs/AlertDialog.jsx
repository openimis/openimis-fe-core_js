import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Grid,
} from "@mui/material";
import GetIconComponent from "../../helpers/icons";

const ArrowDropDownIcon = GetIconComponent("ArrowDropDown");
const ArrowRightIcon = GetIconComponent("ArrowRight");
const CheckCircleIcon = GetIconComponent("CheckCircle");
const ErrorIcon = GetIconComponent("Error");
const WarningIcon = GetIconComponent("Warning");
const InfoIcon = GetIconComponent("Info");
import { clearAlert } from "../../actions";
import { formatMessage } from "../../helpers/i18n";
import { ensureArray } from "../../helpers/utils";
import MetadataViewer from "../generics/MetadataViewer";

/** a detail worth rendering as a key/value table rather than as raw text */
const isStructured = (detail) =>
  typeof detail === "object" ? detail !== null : typeof detail === "string" && detail.trim().startsWith("{");

class AlertDialog extends Component {
  state = {
    expanded: true,
  };

  toggleOpen = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const { intl, alert, clearAlert } = this.props;
    const alertType = alert?.type || alert?.status || alert?.severity;
    const isSuccess = alertType === "success";
    const isWarning = alertType === "warning";
    const isInfo = alertType === "info";
    const isError = alertType === "error" || (!isSuccess && !isWarning && !isInfo);

    const defaultTitle = isSuccess
      ? formatMessage(intl, "core", "success")
      : formatMessage(intl, "core", "FatalError.title");

    const StatusIcon = isSuccess ? CheckCircleIcon : isWarning ? WarningIcon : isInfo ? InfoIcon : ErrorIcon;
    const statusColor = isSuccess ? "success.main" : isWarning ? "warning.main" : isInfo ? "info.main" : "error.main";

    const hasMetadata = Boolean(alert?.metadata);
    const hasDetail = Boolean(alert?.detail);
    const hasExpandable = hasMetadata || hasDetail;

    return (
      <Dialog
        open={Boolean(alert)}
        onClose={() => clearAlert()}
        maxWidth="sm"
        fullWidth
      >
        {alert && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, pb: 1 }}>
              <Box component="span" sx={{ color: statusColor, fontSize: 28, display: "inline-flex", flexShrink: 0 }}>
                <StatusIcon />
              </Box>
              <Typography component="span" variant="h6">
                {alert.title ?? defaultTitle}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container direction="column" spacing={1}>
                <Grid size={12}>
                  {ensureArray(alert.message ?? formatMessage(intl, "core", "FatalError.message")).map((message, i) => (
                    <DialogContentText key={`message-${i}`} sx={{ mb: 0.5 }}>
                      {message}
                    </DialogContentText>
                  ))}
                </Grid>

                {hasExpandable && (
                  <Grid size={12} sx={{ mt: 0.75 }}>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={this.toggleOpen}
                      sx={{ textTransform: "none", px: 0.75, py: 0.25 }}
                      startIcon={this.state.expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                    >
                      {formatMessage(intl, "core", this.state.expanded ? "hideDetails" : "showDetails")}
                    </Button>

                    {this.state.expanded && (
                      <Box sx={{ mt: 0.75 }}>
                        {alert.metadata || isStructured(alert.detail) ? (
                          <MetadataViewer metadata={alert.metadata ?? alert.detail} />
                        ) : (
                          alert.detail && (
                            <Typography
                              variant="body2"
                              sx={{
                                backgroundColor: "action.hover",
                                border: 1,
                                borderColor: "divider",
                                p: 1.25,
                                borderRadius: 1,
                                fontFamily: "monospace",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: isError ? "error.main" : "text.primary",
                              }}
                            >
                              {alert.detail}
                            </Typography>
                          )
                        )}
                      </Box>
                    )}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button onClick={() => clearAlert()} color="primary" autoFocus>
            {formatMessage(intl, "core", "close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      clearAlert,
    },
    dispatch,
  );
};

export { AlertDialog };
export default injectIntl(connect((state) => ({ alert: state.core.alert }), mapDispatchToProps)(AlertDialog));
