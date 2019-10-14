import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from 'clsx';
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    CircularProgress, ClickAwayListener, List, ListItem, ListItemText, ListItemIcon,
    Drawer, Divider, IconButton, Grid, Popover, Paper, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MoreIcon from "@material-ui/icons/KeyboardArrowDown";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { fetchMutation, fetchHistoricalMutations } from "../actions";
import withModulesManager from "../helpers/modules";
import moment from "moment";
import _ from "lodash";

const styles = theme => ({
    toolbar: {
        minHeight: 80,
    },
    drawer: {
        width: theme.jrnlDrawer.width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: theme.jrnlDrawer.open.width,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.jrnlDrawer.close.width,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    jrnlItem: {
    },
    jrnlIcon: {
        paddingLeft: theme.spacing(1),
    },
    jrnlErrorItem: {
        color: theme.palette.error.main,
    },
    jrnlErrorIcon: {
        paddingLeft: theme.spacing(1),
        color: theme.palette.error.main,
    },
    errorPopover: {
        width: 350
    },
    errorPanel: {
        width: "100%",
        color: theme.palette.error.main,
    }
});

class ErrorDetail extends Component {

    state = {
        expanded: false
    }

    handleChange = panel => (event, newExpanded) => {
        event.stopPropagation();
        this.setState({
            expanded: newExpanded ? panel : false
        })
    }

    formatError = (error, idx) => {
        if (error.hasOwnProperty("message")) {
            return (
                <ExpansionPanel key={`error-${idx}-panel`}
                    expanded={error.hasOwnProperty("detail") && this.state.expanded === `error-${idx}`}
                    onChange={this.handleChange(`error-${idx}`)}
                    className={this.props.classes.errorPanel}
                >
                    <ExpansionPanelSummary
                        id={`error-${idx}-header`}
                        expandIcon={error.hasOwnProperty("detail") && <ExpandMoreIcon />}
                    >
                        <Typography variant="caption">{error.hasOwnProperty("code") ? `${error.code}: ` : ""}{error.message}</Typography>
                    </ExpansionPanelSummary>
                    {error.hasOwnProperty("detail") &&
                        <ExpansionPanelDetails>
                            <Typography variant="caption">
                                {error.detail}
                            </Typography>
                        </ExpansionPanelDetails>
                    }
                </ExpansionPanel>
            )
        } else {
            return <Grid key={`error-${idx}-panel`} item>{JSON.stringify(error)}</Grid>
        }
    }

    render() {
        const { classes, anchorEl, onClick, errors } = this.props;
        if (!errors) return null;
        let errs = [errors]
        try {
            errs = JSON.parse(errors);
            if (!Array.isArray(errs)) {
                errs = [errs]
            }
        } catch (err) {
            //let's keep the raw errors then
        }
        return (
            <ClickAwayListener onClickAway={onClick}>
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    onClick={onClick}
                    PaperProps={{ className: classes.errorPopover }}
                >
                    <Grid container>
                        {errs.map((error, idx) => this.formatError(error, idx))}
                    </Grid>
                </Popover>
            </ClickAwayListener>
        )
    }
}

const StyledErrorDetail = withTheme(withStyles(styles)(ErrorDetail));

class JournalDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageSize: props.modulesManager.getConf("fe-core", "journalDrawer.pageSize", 5),
            afterCursor: null,
            hasNextPage: false,
            displayedMutations: [],
            errorAnchor: null,
        }
    }

    componentDidMount() {
        this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
        this.setState({
            timeoutId: setInterval(
                this.checkProcessing,
                this.props.modulesManager.getRef("core.JournalDrawer.pollInterval")
            ),
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchingHistoricalMutations && !this.props.fetchingHistoricalMutations) {
            this.setState({
                displayedMutations: [...this.state.displayedMutations, ...this.props.mutations],
                afterCursor: this.props.mutationsPageInfo.endCursor,
                hasNextPage: this.props.mutationsPageInfo.hasNextPage
            })
        } else if (!_.isEqual(prevProps.mutations, this.props.mutations)) {
            let prevMutationIds = prevProps.mutations.map(m => m.id);
            let new_mutations = [...this.props.mutations].filter(m => !prevMutationIds.includes(m.id))
            this.setState({
                displayedMutations: [...new_mutations, ...this.state.displayedMutations]
            })
        }
    }

    componentWillUnmount() {
        clearTimeout(this.state.timeoutId);
    }

    checkProcessing = () => {
        if (!!this.props.fetchingMutations) {
            return;
        }
        var ids = this.state.displayedMutations.filter(m => m.status === 0).map(m => m.id);
        //TODO: change for a "fetchMutationS(ids)"  > requires id_In backend implementation
        ids.forEach(id => this.props.fetchMutation(id));
    }

    more = e => {
        this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
    }

    showError = (e, m) => {
        this.setState({
            errorAnchor: e.currentTarget,
            errors: m.error
        })
    }

    hideError = e => {
        this.setState({
            errorAnchor: null,
            errors: null,
        })
    }

    render() {
        const { theme, classes, open, handleDrawer } = this.props;
        return (
            <ClickAwayListener onClickAway={e => open && handleDrawer()}>
                <nav className={classes.drawer}>
                    <StyledErrorDetail
                        anchorEl={this.state.errorAnchor}
                        errors={this.state.errors}
                        onClick={this.hideError}
                    />
                    <Drawer
                        variant="permanent"
                        anchor="right"
                        className={clsx(classes.drawer, {
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                        })}
                        classes={{
                            paper: clsx({
                                [classes.drawerOpen]: open,
                                [classes.drawerClose]: !open,
                            }),
                        }}
                        open={open}
                    >
                        <Grid container className={classes.toolbar} justify="center" alignItems="center">
                            <Grid item>
                                <IconButton onClick={handleDrawer}>
                                    {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Divider />
                        <List>
                            {this.state.displayedMutations.map((m, idx) => (
                                <ListItem key={`mutation${idx}`} className={classes.jrnlItem}>
                                    {m.status === 0 && (
                                        <ListItemIcon className={classes.jrnlIcon}>
                                            <CircularProgress size={theme.jrnlDrawer.iconSize} />
                                        </ListItemIcon>)}
                                    {m.status === 1 && (
                                        <ListItemIcon
                                            className={classes.jrnlErrorIcon}
                                            onClick={e => this.showError(e, m)}
                                        >
                                            <ErrorIcon />
                                        </ListItemIcon>)}
                                    {m.status === 2 && (
                                        <ListItemIcon className={classes.jrnlIcon}>
                                            <CheckIcon />
                                        </ListItemIcon>)}
                                    <ListItemText
                                        className={m.status === 1 ? classes.jrnlErrorItem : classes.jrnlItem}
                                        primary={m.clientMutationLabel}
                                        secondary={moment(m.requestDateTime).format("YYYY-MM-DD HH:mm")} />
                                </ListItem>
                            ))}
                            {!!this.state.hasNextPage && (
                                <ListItem key={`more`} className={classes.jrnlItem}>
                                    <IconButton onClick={this.more} className={classes.jrnlIcon}><MoreIcon /></IconButton>
                                </ListItem>
                            )}
                        </List>

                    </Drawer>
                </nav>
            </ClickAwayListener>
        )
    }
}


const mapStateToProps = (state, props) => ({
    fetchingMutations: state.core.fetchingMutations,
    fetchingHistoricalMutations: state.core.fetchingHistoricalMutations,
    mutations: state.core.mutations,
    mutationsPageInfo: state.core.mutationsPageInfo,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchMutation, fetchHistoricalMutations }, dispatch);
};


export default withModulesManager(withTheme(withStyles(styles)
    (connect(mapStateToProps, mapDispatchToProps)(JournalDrawer))
));