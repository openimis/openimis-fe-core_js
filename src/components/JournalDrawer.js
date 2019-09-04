import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from 'clsx';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { CircularProgress, ClickAwayListener, List, ListItem, ListItemText, ListItemIcon, Drawer, Divider, IconButton, Grid, Tooltip } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MoreIcon from "@material-ui/icons/KeyboardArrowDown";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
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
        color: theme.palette.error.main,
    },
});

class JournalDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageSize: props.modulesManager.getConf("fe-core", "journalDrawer.pageSize", 5),
            afterCursor: null,
            hasNextPage: false,
            displayedMutations: [],
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
        if (!_.isEqual(prevProps.mutationsPageInfo, this.props.mutationsPageInfo)) {
            this.setState({
                displayedMutations: [...this.state.displayedMutations, ...this.props.mutations],
                afterCursor: this.props.mutationsPageInfo.endCursor,
                hasNextPage: this.props.mutationsPageInfo.hasNextPage
            })
        }
        if (!_.isEqual(prevProps.mutations, this.props.mutations)) {
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

    render() {
        const { theme, classes, open, handleDrawer } = this.props;
        return (
            <ClickAwayListener onClickAway={e => open && handleDrawer()}>
                <nav className={classes.drawer}>
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
                                        <Tooltip title={m.error} className={classes.jrnlIcon}>
                                            <ListItemIcon className={classes.jrnlErrorIcon}>
                                                <ErrorIcon />
                                            </ListItemIcon>
                                        </Tooltip>)}
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
    mutations: state.core.mutations,
    mutationsPageInfo: state.core.mutationsPageInfo,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchMutation, fetchHistoricalMutations }, dispatch);
};


export default withModulesManager(withTheme(withStyles(styles)
    (connect(mapStateToProps, mapDispatchToProps)(JournalDrawer))
));