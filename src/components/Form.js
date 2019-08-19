import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { Fab, Grid, Paper, IconButton, Typography, Divider } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/SaveAlt";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ReplayIcon from "@material-ui/icons/Replay"
import FormattedMessage from "./FormattedMessage";
import withHistory, { historyPush } from "../helpers/history";
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
        dirty: false,
    }

    componentDidMount() {
        this.setState({ edited: this.props.edited })
    }

    componentDidUpdate(prevProps, preState, snapshot) {
        if (!_.isEqual(prevProps.edited, this.props.edited)) {
            this.setState({ edited: this.props.edited })
        }
    }

    updateAttribute = (attr, value) => {
        const edited = this.state.edited;
        edited[attr] = value;
        this.setState({
            dirty: true,
            edited,
        });
    }

    render() {
        const { classes, module, back = null, save, reload, title, HeadPanel, Panels } = this.props;
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
                                                    <IconButton onClick={e => historyPush(this.props.history, back)}>
                                                        <ChevronLeftIcon />
                                                    </IconButton>
                                                </Grid>
                                            )}
                                            {!!title && (
                                                <Grid item className={classes.paperHeader}>
                                                    <Typography variant="h6"><FormattedMessage module={module} id={title} /></Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                    {!!this.state.dirty && (
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
                                    <HeadPanel edited={this.state.edited} updateAttribute={this.updateAttribute} />
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                    {!!Panels && Panels.map((P, idx) => (
                        <Grid key={`form_pannel_${idx}`} item xs={12}>
                            <Paper className={classes.paper}>
                                <P edited={this.state.edited} updateAttribute={this.updateAttribute} />
                            </Paper>
                        </Grid>
                    ))}

                </form >
                {!this.state.dirty && (
                    <Fab color="primary"
                        className={classes.fab}>
                        <AddIcon />
                    </Fab>
                )}
                {!!this.state.dirty && (
                    <Fab color="primary"
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