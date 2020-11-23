import React, { Component } from 'react';
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
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
} from '@material-ui/core';
import { clearAlert } from "../../actions";
import { formatMessage } from "../../helpers/i18n";

class AlertDialog extends Component {

    state = {
        expanded: false,
    }

    toggleOpen = () => {
        this.setState({ expanded: !this.state.expanded })
    };

    handleClose = () => {
        this.props.clearAlert();
    };

    render() {
        const { intl, alert } = this.props;
        return (
            <div>
                <Dialog
                    open={!!alert}
                    onClose={this.handleClose}
                >
                    {!!alert && !!alert.title && <DialogTitle>{alert.title}</DialogTitle>}
                    {!!alert && !!alert.message && !Array.isArray(alert.message) &&
                        <DialogContent>
                            <DialogContentText onClick={this.toggleOpen}>{alert.message}</DialogContentText>
                            {!!alert.detail && this.state.expanded && (
                                <Typography>{alert.detail}</Typography>
                            )}
                        </DialogContent>
                    }
                    {!!alert && !!alert.message && !!Array.isArray(alert.message) &&
                        <DialogContent>
                            <Grid container>
                                {alert.message.map((m,i) => <Grid key={`message-${i}`}item><DialogContentText>{m}</DialogContentText></Grid>)}
                            </Grid>
                        </DialogContent>
                    }
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary" autoFocus>
                            {formatMessage(intl, "core", "close")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            clearAlert,
        },
        dispatch);
};

export default injectIntl(connect(null, mapDispatchToProps)(AlertDialog));