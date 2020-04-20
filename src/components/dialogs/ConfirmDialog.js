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
    DialogTitle
} from '@material-ui/core';
import { clearConfirm } from "../../actions";
import { formatMessage } from "../../helpers/i18n";

class AlertDialog extends Component {

    handleCancel = () => {
        this.props.clearConfirm(false);
    };

    handleConfirm = () => {
        this.props.clearConfirm(true);
    };

    render() {
        const { intl, confirm } = this.props;
        return (
            <div>
                <Dialog
                    open={!!confirm}
                    onClose={this.handleCancel}
                >
                    {!!confirm && !!confirm.title && <DialogTitle>{confirm.title}</DialogTitle>}
                    {!!confirm && !!confirm.message &&
                        <DialogContent>
                            <DialogContentText>{confirm.message}</DialogContentText>
                        </DialogContent>
                    }
                    <DialogActions>
                        <Button onClick={this.handleCancel}>
                            {formatMessage(intl, "core", "cancel")}
                        </Button>
                        <Button onClick={this.handleConfirm} color="primary" autoFocus>
                            {formatMessage(intl, "core", "ok")}
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
            clearConfirm,
        },
        dispatch);
};

export default injectIntl(connect(null, mapDispatchToProps)(AlertDialog));