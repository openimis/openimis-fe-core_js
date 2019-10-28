import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { Fab, Grid, Paper, IconButton, Typography, Divider } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/SaveAlt";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ReplayIcon from "@material-ui/icons/Replay"
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
        dirty: false,
        saving: false,
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset ||
            prevProps.edited_id !== this.props.edited_id) {
            this.setState({ dirty: false, saving: false });
        } else if (prevProps.update !== this.props.update) {
            this.setState({ saving: false });
        }
    }

    onEditedChanged = data => {
        this.setState({ dirty: true },
            e => this.props.onEditedChanged(data)
        )
    }

    save = data => {
        this.setState(
            { saving: true },
            this.props.save(data)
        )
    }

    render() {
        const { classes, module, back, add, openDirty = false,
            save, canSave, reload, actions = [],
            title, titleParams = [], HeadPanel, Panels, ...others } = this.props;
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
                                    {!!actions && !this.state.dirty && (
                                        <Grid item xs={1}>
                                            <Grid container justify="flex-end">
                                                {actions.map((a, idx) =>
                                                    <Grid item key={`form-action-${idx}`} className={classes.paperHeader}>
                                                        <Grid item className={classes.paperHeaderAction}>
                                                            <IconButton onClick={a.doIt}>
                                                                {a.icon}
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12}>
                                    <HeadPanel
                                        edited={this.props.edited}
                                        edited_id={this.props.edited_id}
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
                                    edited={this.props.edited}
                                    edited_id={this.props.edited_id}
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
                {(!!this.state.dirty || !!openDirty) && !!save && (
                    <Fab color="primary"
                        disabled={!!this.state.saving || (!!canSave && !canSave())}
                        className={classes.fab}
                        onClick={e => this.save(this.props.edited)}>
                        <SaveIcon />
                    </Fab>
                )}
            </Fragment>
        )
    }
}

export default withHistory(injectIntl(withTheme(withStyles(styles)(Form))));