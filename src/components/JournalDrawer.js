import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from 'clsx';
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    CircularProgress, ClickAwayListener, List, ListItem, ListItemText, ListItemIcon,
    Drawer, Divider, IconButton, Grid, Popover, Typography,
    Collapse,
    ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MoreIcon from "@material-ui/icons/KeyboardArrowDown";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
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
    jrnlItem: theme.jrnlDrawer.item,
    jrnlItemDetail: theme.jrnlDrawer.itemDetail,
    jrnlItemDetailText: theme.jrnlDrawer.itemDetailText,
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
    messagePopover: {
        width: 350
    },
    groupMessagePanel: {
        width: "100%",
        margin: 0,
        padding: 0,
    },
    errorPanel: {
        width: "100%",
        color: theme.palette.error.main,
    },
    messagePanel: {
        width: "100%",
        margin: theme.spacing(1)
    }
});

class Messages extends Component {

    state = {
        groupExpanded: false,
        expanded: false,
    }

    handleGroupChange = panel => (event, newExpanded) => {
        event.stopPropagation();
        this.setState({
            groupExpanded: newExpanded ? panel : false
        })
    }

    handleChange = panel => (event, newExpanded) => {
        event.stopPropagation();
        this.setState({
            expanded: newExpanded ? panel : false
        })
    }

    formatSingleMessage = (message, idx) => {
        if (message.hasOwnProperty("message")) {
            return (
                <ExpansionPanel key={`message-${idx}-panel`}
                    expanded={message.hasOwnProperty("detail") && this.state.expanded === `message-${idx}`}
                    onChange={this.handleChange(`message-${idx}`)}
                    className={this.props.classes.errorPanel}
                >
                    <ExpansionPanelSummary
                        id={`message-${idx}-header`}
                        expandIcon={message.hasOwnProperty("detail") && <ExpandMoreIcon />}
                    >
                        <Typography variant="caption">{message.hasOwnProperty("code") ? `[${message.code}] ` : ""}{message.message}</Typography>
                    </ExpansionPanelSummary>
                    {message.hasOwnProperty("detail") &&
                        <ExpansionPanelDetails>
                            <Typography variant="caption">
                                {message.detail}
                            </Typography>
                        </ExpansionPanelDetails>
                    }
                </ExpansionPanel >
            )
        } else if (message.hasOwnProperty("clientMutationLabel")) {
            return <Grid key={`message-${idx}-panel`} item className={this.props.classes.messagePanel}>{message.clientMutationLabel}</Grid>
        } else {
            return <Grid key={`message-${idx}-panel`} item>{JSON.stringify(message)}</Grid>
        }
    }

    formatMessage = (message, idx) => {
        if (message.hasOwnProperty('title')) {
            return (
                <ExpansionPanel key={`groupMessage-${idx}-panel`}
                    expanded={this.state.groupExpanded === `groupMessage-${idx}`}
                    onChange={this.handleGroupChange(`groupMessage-${idx}`)}
                    className={this.props.classes.groupMessagePanel}
                >
                    <ExpansionPanelSummary
                        id={`groupMessage-${idx}-header`}
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography variant="caption">{message.title}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={this.props.classes.groupMessagePanel}>
                        <Grid container spacing={0}>
                            {message.list.map((m, i) => (
                                <Grid item xs={12}>
                                    {this.formatSingleMessage(m, `${idx}.${i}`)}
                                </Grid>))
                            }
                        </Grid>
                    </ExpansionPanelDetails>

                </ExpansionPanel >
            )
        } else {
            return this.formatSingleMessage(message, idx)
        }
    }

    render() {
        const { classes, anchorEl, onClick, messages } = this.props;
        if (!messages) return null;
        let msgs = [messages]
        try {
            msgs = JSON.parse(messages);
            if (!Array.isArray(msgs)) {
                msgs = [msgs]
            }
        } catch (err) {
            //let's keep the raw message then
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
                    PaperProps={{ className: classes.messagePopover }}
                >
                    <Grid container>
                        {msgs.map((msg, idx) => this.formatMessage(msg, idx))}
                    </Grid>
                </Popover>
            </ClickAwayListener>
        )
    }
}

const StyledMessages = withTheme(withStyles(styles)(Messages));

class JournalDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageSize: props.modulesManager.getConf("fe-core", "journalDrawer.pageSize", 5),
            afterCursor: null,
            hasNextPage: false,
            displayedMutations: [],
            messagesAnchor: null,
            expanded: false,
        }
    }

    componentDidMount() {
        if (!this.props.mutations || !this.props.mutations.length) {
            this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
        }
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

    showMessages = (e, m) => {
        this.setState({
            messagesAnchor: e.currentTarget,
            messages: m,
        })
    }

    hideMessages = e => {
        this.setState({
            messagesAnchor: null,
            messages: null,
        })
    }

    handleChange = (event, newExpanded) => {
        event.stopPropagation();
        this.setState({
            expanded: newExpanded
        })
    }

    render() {
        const { theme, classes, open, handleDrawer } = this.props;
        return (
            <ClickAwayListener onClickAway={e => open && handleDrawer()}>
                <nav className={classes.drawer}>
                    <StyledMessages
                        anchorEl={this.state.messagesAnchor}
                        messages={this.state.messages}
                        error={this.state.Err}
                        onClick={this.hideMessages}
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
                                <Fragment key={`mutation${idx}`}>
                                    <ListItem key={`mutation-label${idx}`} className={classes.jrnlItem}>
                                        {m.status == 0 && (
                                            <ListItemIcon className={classes.jrnlIcon}>
                                                <CircularProgress size={theme.jrnlDrawer.iconSize} />
                                            </ListItemIcon>)}
                                        {m.status === 1 && (
                                            <ListItemIcon
                                                className={classes.jrnlErrorIcon}
                                                onClick={e => this.showMessages(e, m.error)}
                                            >
                                                <ErrorIcon />
                                            </ListItemIcon>)}
                                        {m.status === 2 && (
                                            <ListItemIcon
                                                className={classes.jrnlIcon}
                                                onClick={e => this.showMessages(e, m)}>
                                                <CheckIcon />
                                            </ListItemIcon>)}
                                        <ListItemText
                                            className={m.status === 1 ? classes.jrnlErrorItem : classes.jrnlItem}
                                            primary={m.clientMutationLabel}
                                            secondary={moment(m.requestDateTime).format("YYYY-MM-DD HH:mm")}
                                        />
                                        {!!m.clientMutationDetails && this.state.expanded === `detail-${idx}` && <IconButton onClick={e => this.handleChange(e, false)}><ExpandLessIcon /></IconButton>}
                                        {!!m.clientMutationDetails && this.state.expanded !== `detail-${idx}` && <IconButton onClick={e => this.handleChange(e, `detail-${idx}`)}><ExpandMoreIcon /></IconButton>}
                                    </ListItem>
                                    {!!m.clientMutationDetails && (
                                        <Collapse key={`mutation-detail${idx}`} in={!!m.clientMutationDetails && this.state.expanded === `detail-${idx}`} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {JSON.parse(m.clientMutationDetails).map((d, di) =>
                                                    <ListItemText
                                                        className={classes.jrnlItemDetail}
                                                        key={`mdet-${di}`}
                                                        primary={d}
                                                        primaryTypographyProps={{ class: classes.jrnlItemDetailText }}
                                                    />
                                                )}
                                            </List>
                                        </Collapse>
                                    )}
                                </Fragment>
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