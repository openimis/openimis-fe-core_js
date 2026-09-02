import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import {
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
      ? (formatMessage(intl, "core", "success") || "Success")
      : formatMessage(intl, "core", "FatalError.title");

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
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
              {isSuccess && <CheckCircleIcon style={{ color: "#2e7d32", fontSize: 28, flexShrink: 0 }} />}
              {isError && <ErrorIcon style={{ color: "#d32f2f", fontSize: 28, flexShrink: 0 }} />}
              {isWarning && <WarningIcon style={{ color: "#ed6c02", fontSize: 28, flexShrink: 0 }} />}
              {isInfo && <InfoIcon style={{ color: "#0288d1", fontSize: 28, flexShrink: 0 }} />}
              <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{alert.title ?? defaultTitle}</span>
            </DialogTitle>
            <DialogContent style={{ paddingTop: 8 }}>
              <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                  {ensureArray(alert.message ?? formatMessage(intl, "core", "FatalError.message")).map(
                    (message, i) => (
                      <DialogContentText key={`message-${i}`} style={{ color: "#334155", fontSize: "0.92rem", marginBottom: 4 }}>
                        {message}
                      </DialogContentText>
                    ),
                  )}
                </Grid>

                {hasExpandable && (
                  <Grid item xs={12} style={{ marginTop: 6 }}>
                    <Button
                      size="small"
                      onClick={this.toggleOpen}
                      style={{ textTransform: "none", padding: "2px 6px", color: "#64748b" }}
                      startIcon={this.state.expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                    >
                      {this.state.expanded
                        ? (formatMessage(intl, "core", "hideDetails") || "Hide details")
                        : (formatMessage(intl, "core", "showDetails") || "Show details")}
                    </Button>

                    {this.state.expanded && (
                      <div style={{ marginTop: 6 }}>
                        {alert.metadata ? (
                          <MetadataViewer metadata={alert.metadata} />
                        ) : alert.detail ? (
                          typeof alert.detail === "object" || (typeof alert.detail === "string" && alert.detail.startsWith("{")) ? (
                            <MetadataViewer metadata={alert.detail} />
                          ) : (
                            <Typography
                              variant="body2"
                              style={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                padding: 10,
                                borderRadius: 6,
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                                color: isError ? "#b91c1c" : "#334155",
                              }}
                            >
                              {alert.detail}
                            </Typography>
                          )
                        ) : null}
                      </div>
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
