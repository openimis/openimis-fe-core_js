import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from 'clsx';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { CircularProgress, ClickAwayListener, List, ListItem, ListItemText, ListItemIcon, Drawer, Divider, IconButton, Grid } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import { fetchMutations } from "../actions";
import withModulesManager from "../helpers/modules";

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
    jrnlItem: {},
    jrnlErrorItem: {
        color: theme.palette.error.main
    },
    jrnlErrorIcon: {
        color: theme.palette.error.main
    },
});

class JournalDrawer extends Component {
    componentDidMount() {
        this.setState({
            timeoutId: setInterval(
                this.checkProcessing,
                this.props.modulesManager.getRef("core.JournalDrawer.pollInterval")
            ),
        });
    }
    componentWillUnmount() {
        clearTimeout(this.state.timeoutId);
    }

    checkProcessing = () => {
        if (!!this.props.fetchingMutations) {
            return;
        }
        var ids = this.props.mutations.filter(m => m.status === 0).map(m => m.internalId);
        if (!ids.length) {
            return;
        }
        this.props.fetchMutations(ids);
    }

    render() {
        const { theme, classes, open, handleDrawer, mutations } = this.props;
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
                            {mutations.map((m, idx) => (
                                <ListItem key={`mutation${idx}`}>
                                    {m.status === 0 && (
                                        <ListItemIcon>
                                            <CircularProgress size={theme.jrnlDrawer.iconSize} />
                                        </ListItemIcon>)}
                                    {m.status === 1 && (
                                        <ListItemIcon>
                                            <CheckIcon />
                                        </ListItemIcon>)}
                                    {m.status === 2 && (
                                        <ListItemIcon className={classes.jrnlErrorIcon}>
                                            <ErrorIcon />
                                        </ListItemIcon>)}
                                    <ListItemText className={m.status === 2 ? classes.jrnlErrorItem : classes.jrnlItem} primary={m.label} secondary={m.detail} />
                                </ListItem>
                            ))}
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
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchMutations }, dispatch);
};


export default withModulesManager(withTheme(withStyles(styles)
    (connect(mapStateToProps, mapDispatchToProps)(JournalDrawer))
));