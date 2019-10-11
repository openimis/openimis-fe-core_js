import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { Fab, Grid, Paper, IconButton, Typography, Divider } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/SaveAlt";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ReplayIcon from "@material-ui/icons/Replay"
import PrintIcon from "@material-ui/icons/ListAlt";
import FormattedMessage from "./FormattedMessage";
import withHistory from "../helpers/history";
import _ from "lodash";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab
});

class Form extends Component {
    state = {
        edited: {},
        edited_id: null,
        dirty: false,
    }

    _resetState(dirty) {
        this.setState({
            edited: { ...this.props.edited },
            edited_id: this.props.edited_id,
            dirty
        });
    }

    componentDidMount() {
        this._resetState(false);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset ||
            prevProps.edited_id !== this.props.edited_id) {
            this._resetState(false);
        } else if (!_.isEqual(prevProps.edited, this.props.edited)) {
            this._resetState(this.state.dirty);
        }
    }

    onEditedChanged = data => {
        this.setState({ dirty: true },
            e => this.props.onEditedChanged(data)
        )
    }

    render() {
        const { classes, module, back, add, openDirty=false, save, canSave, reload, print, title, titleParams = [], HeadPanel, Panels, ...others } = this.props;
        return (
            <Fragment>
                <form noValidate autoComplete="off">
                    <Grid container>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Grid container alignItems="center" direction="row">
                                    <Grid item xs={11}>
                                        <Grid container alignItems="center">
                                            {!!back && (
                                                <Grid item className={classes.paperHeader}>
                                                    <IconButton onClick={back}>
                                                        <ChevronLeftIcon />
                                                    </IconButton>
                                                </Grid>
                                            )}
                                            {!!title && (
                                                <Grid item className={classes.paperHeader}>
                                                    <Typography variant="h6"><FormattedMessage module={module} id={title} values={titleParams} /></Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                    {!!reload && !!this.state.dirty && (
                                        <Grid item xs={1} className={classes.paperHeader}>
                                            <Grid container justify="flex-end">
                                                <Grid item className={classes.paperHeaderAction}>
                                                    <IconButton onClick={reload}>
                                                        <ReplayIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}
                                    {!!print && !this.state.dirty && (
                                        <Grid item xs={1} className={classes.paperHeader}>
                                            <Grid container justify="flex-end">
                                                <Grid item className={classes.paperHeaderAction}>
                                                    <IconButton onClick={print}>
                                                        <PrintIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12}>
                                    <HeadPanel
                                        edited={this.state.edited}
                                        edited_id={this.state.edited_id}
                                        {...others}
                                        onEditedChanged={this.onEditedChanged}
                                    />
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                    {!!Panels && Panels.map((P, idx) => (
                        <Grid key={`form_pannel_${idx}`} item xs={12}>
                            <Paper className={classes.paper}>
                                <P
                                    edited={this.state.edited}
                                    edited_id={this.state.edited_id}
                                    {...others}
                                    onEditedChanged={this.onEditedChanged}
                                />
                            </Paper>
                        </Grid>
                    ))}

                </form >
                {!this.state.dirty && !!add && (
                    <Fab color="primary"
                        className={classes.fab}
                        onClick={add}>
                        <AddIcon />
                    </Fab>
                )}
                {(!!this.state.dirty || !! openDirty) && !!save && (
                    <Fab color="primary"
                        disabled={!!canSave && !canSave(this.state.edited)}
                        className={classes.fab}
                        onClick={e => save(this.state.edited)}>
                        <SaveIcon />
                    </Fab>
                )}
            </Fragment>
        )
    }
}

export default withHistory(injectIntl(withTheme(withStyles(styles)(Form))));