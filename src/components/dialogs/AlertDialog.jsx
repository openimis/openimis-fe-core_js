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

class AlertDialog extends Component {
  state = {
    expanded: false,
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

    return (
      <Dialog open={Boolean(alert)} onClose={() => clearAlert()}>
        {alert && (
          <>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isSuccess && <CheckCircleIcon style={{ color: "#2e7d32", fontSize: 28, flexShrink: 0 }} />}
              {isError && <ErrorIcon style={{ color: "#d32f2f", fontSize: 28, flexShrink: 0 }} />}
              {isWarning && <WarningIcon style={{ color: "#ed6c02", fontSize: 28, flexShrink: 0 }} />}
              {isInfo && <InfoIcon style={{ color: "#0288d1", fontSize: 28, flexShrink: 0 }} />}
              <span>{alert.title ?? defaultTitle}</span>
            </DialogTitle>
            <DialogContent>
              <Grid container>
                <Grid onClick={this.toggleOpen}>
                  {alert.detail && this.state.expanded && <ArrowDropDownIcon />}
                  {alert.detail && !this.state.expanded && <ArrowRightIcon />}
                </Grid>
                <Grid>
                  <Grid container onClick={this.toggleOpen}>
                    {ensureArray(alert.message ?? formatMessage(intl, "core", "FatalError.message")).map(
                      (message, i) => (
                        <Grid key={`message-${i}`}>
                          <DialogContentText>{message}</DialogContentText>
                        </Grid>
                      ),
                    )}
                  </Grid>
                  {alert.detail && (
                    <Typography style={{ visibility: this.state.expanded ? "visible" : "hidden" }}>
                      {alert.detail}
                    </Typography>
                  )}
                </Grid>
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
