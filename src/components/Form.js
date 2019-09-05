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
        edited: {},
        edited_id: null,
        dirty: false,
    }

    _resetState() {
        this.setState({
            edited: {...this.props.edited},
            edited_id: this.props.edited_id,
            dirty: false,
        });
    }

    componentDidMount() {
        this._resetState();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.edited_id !== this.props.edited_id ||
            !_.isEqual(prevProps.edited, this.props.edited) ||
            prevProps.reset !== this.props.reset ||
            prevProps.update !== this.props.update) {
            this._resetState();
        }
    }

    updateAttribute = (attr, value, str) => {
        const edited = { ...this.state.edited };
        edited[attr] = value;
        if (str !== undefined) {
            edited[`${attr}_str`] = str;
        }
        this.setState({
            dirty: true,
            edited,
        });
    }

    render() {
        const { classes, module, back, add, save, canSave, reload, title, titleParams = [], HeadPanel, Panels, ...others } = this.props;
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
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12}>
                                    <HeadPanel
                                        edited={this.state.edited}
                                        edited_id={this.state.edited_id}
                                        updateAttribute={this.updateAttribute}
                                        {...others}
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
                                    updateAttribute={this.updateAttribute}
                                    {...others}
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
                {!!this.state.dirty && !!save && (
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