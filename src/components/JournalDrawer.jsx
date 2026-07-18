import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from "clsx";
import { styled, useTheme } from "@mui/material/styles";
import {
  CircularProgress,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Divider,
  IconButton,
  Grid,
  Popover,
  Typography,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import GetIconComponent from "../helpers/icons";
const ChevronLeftIcon = GetIconComponent("ChevronLeft");
const ChevronRightIcon = GetIconComponent("ChevronRight");
const MoreIcon = GetIconComponent("KeyboardArrowDown");
const CheckIcon = GetIconComponent("CheckCircleOutline");
const ErrorIcon = GetIconComponent("ErrorOutline");
const ExpandLessIcon = GetIconComponent("ExpandLess");
const ExpandMoreIcon = GetIconComponent("ExpandMore");
import { fetchMutation, fetchHistoricalMutations } from "../actions";
import withModulesManager from "../helpers/modules";
import { getLocalStorage, setLocalStorage } from "../helpers/useLocalStorage";
import moment from "moment";
import _ from "lodash";
import { CLAIM_STATS_ORDER, GLOBAL_UNDERSCORE, REQUEST_LIMIT, WHITE_SPACE } from "../constants";

const StyledJournalDrawer = styled("div")(({ theme }) => ({
  "& .toolbar": {
    minHeight: 80,
  },
  "& .drawer": {
    position: "fixed",
    right: 0,
    top: 0,
    height: "100vh",
    flexShrink: 0,
    whiteSpace: "nowrap",
    width: 0,
    zIndex: theme.zIndex.drawer,
  },
  "& .drawerOpen": {
    position: "fixed",
    right: 0,
    top: 0,
    height: "100vh",
    width: theme.jrnlDrawer.open.width,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "& .drawerClose": {
    position: "fixed",
    right: 0,
    top: 0,
    height: "100vh",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.jrnlDrawer.close.width,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  "& .jrnlItem": theme.jrnlDrawer.item,
  "& .jrnlItemDetail": theme.jrnlDrawer.itemDetail,
  "& .jrnlItemDetailsError": {
    ...theme.jrnlDrawer.itemDetail,
    color: theme.palette.error.main,
    whiteSpace: "normal",
    overflowWrap: "break-word",
  },
  "& .jrnlItemDetailText": theme.jrnlDrawer.itemDetailText,
  "& .jrnlIconClickable": {
    cursor: "pointer",
  },
  "& .jrnlIcon": {
    paddingLeft: theme.spacing(1),
  },
  "& .jrnlErrorItem": {
    color: theme.palette.error.main,
  },
  "& .jrnlErrorIcon": {
    paddingLeft: theme.spacing(1),
    color: theme.palette.error.main,
  },
  "& .messagePopover": {
    width: 350,
  },
  "& .groupMessagePanel": {
    width: "100%",
    margin: 0,
    padding: 0,
  },
  "& .errorPanel": {
    width: "100%",
    color: theme.palette.error.main,
  },
  "& .messagePanel": {
    width: "100%",
    margin: theme.spacing(1),
  },
  "& .centerText": {
    textAlign: "center",
  },
  "& .boldCenterText": {
    textAlign: "center",
    fontWeight: "bold",
  },
}));

class Messages extends Component {
  state = {
    groupExpanded: false,
    expanded: false,
  };

  handleGroupChange = (panel) => (event, newExpanded) => {
    event.stopPropagation();
    this.setState({
      groupExpanded: newExpanded ? panel : false,
    });
  };

  handleChange = (panel) => (event, newExpanded) => {
    event.stopPropagation();
    this.setState({
      expanded: newExpanded ? panel : false,
    });
  };

  formatSingleMessage = (message, idx) => {
    if (message.hasOwnProperty("message")) {
      return (
        <Accordion
          key={`message-${idx}-panel`}
          expanded={message.hasOwnProperty("detail") && this.state.expanded === `message-${idx}`}
          onChange={this.handleChange(`message-${idx}`)}
          className="errorPanel"
        >
          <AccordionSummary
            id={`message-${idx}-header`}
            expandIcon={message.hasOwnProperty("detail") && <ExpandMoreIcon />}
          >
            <Typography variant="caption">
              {message.hasOwnProperty("code") ? `[${message.code}] ` : ""}
              {message.message}
            </Typography>
          </AccordionSummary>
          {message.hasOwnProperty("detail") && (
            <AccordionDetails>
              <Typography variant="caption">{message.detail}</Typography>
            </AccordionDetails>
          )}
        </Accordion>
      );
    } else if (message.hasOwnProperty("clientMutationLabel")) {
      return (
        <Grid key={`message-${idx}-panel`} className="messagePanel">
          {message.clientMutationLabel}
        </Grid>
      );
    } else {
      return <Grid key={`message-${idx}-panel`}>{JSON.stringify(message)}</Grid>;
    }
  };

  formatMessage = (message, idx) => {
    if (message.hasOwnProperty("title")) {
      return (
        <Accordion
          key={`groupMessage-${idx}-panel`}
          expanded={this.state.groupExpanded === `groupMessage-${idx}`}
          onChange={this.handleGroupChange(`groupMessage-${idx}`)}
          className="groupMessagePanel"
        >
          <AccordionSummary id={`groupMessage-${idx}-header`} expandIcon={<ExpandMoreIcon />}>
            <Typography variant="caption">{message.title}</Typography>
          </AccordionSummary>
          <AccordionDetails className="groupMessagePanel">
            <Grid container spacing={0}>
              {message.list.map((m, i) => (
                <Grid size={12}>{this.formatSingleMessage(m, `${idx}.${i}`)}</Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    } else {
      return this.formatSingleMessage(message, idx);
    }
  };

  render() {
    const { anchorEl, onClick, messages } = this.props;
    if (!messages) return null;
    const stats = messages?.jsonExt ? JSON.parse(messages.jsonExt) : {};
    let msgs = [messages?.error || messages];
    try {
      msgs = JSON.parse(messages?.error || messages);
      if (!Array.isArray(msgs)) {
        msgs = [msgs];
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
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          onClick={onClick}
          PaperProps={{ className: "messagePopover" }}
        >
          {stats?.claim_stats && (
            <div>
              <Typography className="boldCenterText">{stats.claim_stats["header"]}</Typography>
              {CLAIM_STATS_ORDER.map(
                (key) =>
                  stats.claim_stats.hasOwnProperty(key) && (
                    <Typography className="centerText" key={key}>
                      {`${key.replace(GLOBAL_UNDERSCORE, WHITE_SPACE)}: ${stats.claim_stats[key]}`}
                    </Typography>
                  ),
              )}
            </div>
          )}
          <Grid container>{msgs.map((msg, idx) => this.formatMessage(msg, idx))}</Grid>
        </Popover>
      </ClickAwayListener>
    );
  }
}

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
      limitMutationLogsQuery: props.modulesManager.getConf("fe-core", "journalDrawer.limitMutationLogsQuery", false),
    };
  }

  componentDidMount() {
    if (!this.props.fetchedHistoricalMutations) {
      this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
    }
    this.setState((state, props) => ({
      timeoutId: setInterval(this.checkProcessing, props.modulesManager.getRef("core.JournalDrawer.pollInterval")),
      displayedMutations: [...props.mutations],
    }));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchingHistoricalMutations && !this.props.fetchingHistoricalMutations) {
      this.setState((state, props) => ({
        displayedMutations: [...state.displayedMutations, ...props.mutations],
        afterCursor: props.mutationsPageInfo.endCursor,
        hasNextPage: props.mutationsPageInfo.hasNextPage,
      }));
    } else if (!_.isEqual(prevProps.mutations, this.props.mutations)) {
      this.setState({
        displayedMutations: [...this.props.mutations],
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId);
  }
  checkProcessing = () => {
    var clientMutationIds = this.state.displayedMutations.filter((m) => m.status === 0).map((m) => m.clientMutationId);
    //TODO: change for a "fetchMutationS(ids)"  > requires id_In backend implementation
    if (this.state.limitMutationLogsQuery) {
      var mutationLogs = getLocalStorage("arrayMutations");
      if (mutationLogs == null) {
        mutationLogs = {};
        mutationLogs.arrayMutations = [];
        clientMutationIds.map((id) => {
          mutationLogs.arrayMutations.push({
            id: id,
            count: 0,
            time: 0,
          });
        });
        setLocalStorage("arrayMutations", mutationLogs);
      } else {
        let parsedJson = mutationLogs; // already parsed by getLocalStorage
        for (let i = 0; i < parsedJson.arrayMutations.length; i++) {
          let mutationLog = parsedJson.arrayMutations[i];
          if (!clientMutationIds.includes(mutationLog.id)) {
            //remove success mutationLogs in localStorage
            parsedJson.arrayMutations = parsedJson.arrayMutations.filter((f) => f.id != mutationLog.id);
          } else {
            if (mutationLog.count < REQUEST_LIMIT) {
              this.props.fetchMutation(mutationLog.id);
              mutationLog.count = mutationLog.count + 1;
              if (mutationLog.count == 5) {
                mutationLog.time = mutationLog.count;
                mutationLog.duration = 1;
              }
            } else {
              if (mutationLog.count == mutationLog.time) {
                this.props.fetchMutation(mutationLog.id);
                mutationLog.duration = mutationLog.duration * 2;
                mutationLog.time = mutationLog.count + mutationLog.duration;
              }
              mutationLog.count = mutationLog.count + 1;
            }
            parsedJson.arrayMutations[i] = mutationLog;
          }
        }

        for (let j = 0; j < clientMutationIds.length; j++) {
          if (!parsedJson.arrayMutations.map((m) => m.id).includes(clientMutationIds[j])) {
            parsedJson.arrayMutations.push({
              id: clientMutationIds[j],
              count: 0,
              time: 0,
            });
          }
        }
        setLocalStorage("arrayMutations", parsedJson);
      }
    } else {
      clientMutationIds.forEach((id) => this.props.fetchMutation(id));
    }
  };
  more = (e) => {
    this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
  };

  showMessages = (e, m) => {
    if (this.props.open) {
      return;
    }
    this.setState({
      messagesAnchor: e.currentTarget,
      messages: m,
    });
  };

  hideMessages = (e) => {
    this.setState({
      messagesAnchor: null,
      messages: null,
    });
  };

  handleChange = (event, newExpanded) => {
    event.stopPropagation();
    this.setState({
      expanded: newExpanded,
    });
  };

  render() {
    const { theme, open, handleDrawer } = this.props;
    return (
      <StyledJournalDrawer>
        <ClickAwayListener onClickAway={(e) => open && handleDrawer()}>
          <nav className="drawer">
            <Messages anchorEl={this.state.messagesAnchor} messages={this.state.messages} onClick={this.hideMessages} />
            <Drawer
              variant="permanent"
              anchor="right"
              className={clsx("drawer", {
                "drawerOpen": open,
                "drawerClose": !open,
              })}
              classes={{
                paper: clsx({
                  "drawerOpen": open,
                  "drawerClose": !open,
                }),
              }}
              open={open}
            >
              <Grid container className="toolbar" justifyContent="center" alignItems="center">
                <Grid>
                  <IconButton onClick={handleDrawer}>{open ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
                </Grid>
              </Grid>
              <Divider />
              <List>
                {this.state.displayedMutations.map((m, idx) => (
                  <Fragment key={`mutation${idx}`}>
                    <ListItem key={`mutation-label${idx}`} className="jrnlItem">
                      {m.status == 0 && (
                        <ListItemIcon className="jrnlIcon">
                          <CircularProgress size={theme?.jrnlDrawer?.iconSize || 24} />
                        </ListItemIcon>
                      )}
                      <ListItemIcon
                        className={clsx(m.status === 1 ? "jrnlErrorIcon" : "jrnlIcon", { "jrnlIconClickable": !open })}
                        onClick={(e) => this.showMessages(e, m)}
                      >
                        {m.status === 1 ? <ErrorIcon /> : <CheckIcon />}
                      </ListItemIcon>
                      <ListItemText
                        className={m.status === 1 ? "jrnlErrorItem" : "jrnlItem"}
                        primary={m.clientMutationLabel}
                        secondary={moment(m.requestDateTime).format("YYYY-MM-DD HH:mm")}
                      />
                      {!!m.clientMutationDetails && this.state.expanded === `detail-${idx}` && (
                        <IconButton onClick={(e) => this.handleChange(e, false)}>
                          <ExpandLessIcon />
                        </IconButton>
                      )}
                      {!!m.clientMutationDetails && this.state.expanded !== `detail-${idx}` && (
                        <IconButton onClick={(e) => this.handleChange(e, `detail-${idx}`)}>
                          <ExpandMoreIcon />
                        </IconButton>
                      )}
                    </ListItem>
                    {!!m.clientMutationDetails && (
                      <Collapse
                        key={`mutation-detail${idx}`}
                        in={!!m.clientMutationDetails && this.state.expanded === `detail-${idx}`}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {(() => {
                            try {
                              const details = JSON.parse(m.clientMutationDetails);
                              return details.map((detail, detailIndex) => (
                                <ListItemText
                                  className="jrnlItemDetail"
                                  key={`mdet-${detailIndex}`}
                                  primary={detail}
                                  primaryTypographyProps={{ className: "jrnlItemDetailText" }}
                                />
                              ));
                            } catch (error) {
                              return (
                                <ListItemText
                                  className="jrnlItemDetailsError"
                                  primaryTypographyProps={{ className: "jrnlItemDetailText" }}
                                  primary={`Mutation details not available. ${error}`}
                                />
                              );
                            }
                          })()}
                        </List>
                      </Collapse>
                    )}
                  </Fragment>
                ))}
                {!!this.state.hasNextPage && (
                  <ListItem key={`more`} className="jrnlItem">
                    <IconButton onClick={this.more} className="jrnlIcon">
                      <MoreIcon />
                    </IconButton>
                  </ListItem>
                )}
              </List>
            </Drawer>
          </nav>
        </ClickAwayListener>
      </StyledJournalDrawer>
    );
  }
}

const mapStateToProps = (state, props) => ({
  fetchingMutations: state.core.fetchingMutations,
  fetchingHistoricalMutations: state.core.fetchingHistoricalMutations,
  fetchedHistoricalMutations: state.core.fetchedHistoricalMutations,
  mutations: state.core.mutations,
  mutationsPageInfo: state.core.mutationsPageInfo,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchMutation, fetchHistoricalMutations }, dispatch);
};

const JournalDrawerWithTheme = (props) => {
  const theme = useTheme();
  return <JournalDrawer {...props} theme={theme} />;
};

export { StyledJournalDrawer };
export { Messages };
export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(JournalDrawerWithTheme));
