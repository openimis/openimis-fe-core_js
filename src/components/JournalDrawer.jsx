import React, { Component, Fragment } from "react";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import clsx from "clsx";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  ClickAwayListener,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Divider,
  IconButton,
  Grid,
  Popover,
  Snackbar,
  Tooltip,
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
const CloseIcon = GetIconComponent("Close");
const HistoryIcon = GetIconComponent("History");
import { fetchMutation, fetchHistoricalMutations } from "../actions";
import withModulesManager from "../helpers/modules";
import { getLocalStorage, setLocalStorage } from "../helpers/useLocalStorage";
import { useTranslations } from "../helpers/i18n";
import moment from "moment";
import _ from "lodash";
import { CLAIM_STATS_ORDER, GLOBAL_UNDERSCORE, REQUEST_LIMIT, WHITE_SPACE } from "../constants";

const StyledJournalDrawer = styled("div")(({ theme }) => ({
  // --- classic sidebar (showJournalSidebar = true) ---
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
    width: theme.jrnlDrawer?.open?.width,
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
    width: theme.jrnlDrawer?.close?.width,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  // --- shared journal entry styling ---
  "& .jrnlItem": theme.jrnlDrawer?.item,
  "& .jrnlItemDetail": theme.jrnlDrawer?.itemDetail,
  "& .jrnlItemDetailsError": {
    ...theme.jrnlDrawer?.itemDetail,
    color: theme.palette.error.main,
    whiteSpace: "normal",
    overflowWrap: "break-word",
  },
  "& .jrnlItemDetailText": theme.jrnlDrawer?.itemDetailText,
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
    maxWidth: "calc(100vw - 32px)",
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
  // --- popup journal (showJournalSidebar = false) ---
  "& .drawerPaperDesktop": {
    width: theme.jrnlDrawer?.open?.width || 500,
  },
  "& .drawerPaperMobile": {
    width: "100%",
    height: "100vh",
    maxHeight: "100vh",
    borderRadius: 0,
    "@supports (height: 100dvh)": {
      height: "100dvh",
      maxHeight: "100dvh",
    },
  },
  "& .drawerHeader": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& .resultSnackbar": {
    maxWidth: 420,
  },
}));

const isMutationFinal = (mutation) => mutation?.status !== 0 && mutation?.status !== undefined && mutation?.status !== null;

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
                <Grid key={m.code || m.message || `msg-${idx}-${i}`} size={12}>
                  {this.formatSingleMessage(m, `${idx}.${i}`)}
                </Grid>
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
          TransitionComponent={Fade}
          transitionDuration={{ enter: 250, exit: 250 }}
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

/**
 * The journal entries themselves, shared by the classic sidebar and the popup drawer.
 */
const MutationList = ({
  theme,
  displayedMutations,
  expanded,
  hasNextPage,
  messagesClickable,
  onShowMessages,
  onToggleDetail,
  onLoadMore,
}) => (
  <List>
    {displayedMutations.map((m, idx) => (
      <Fragment key={`mutation${idx}`}>
        <ListItem key={`mutation-label${idx}`} className="jrnlItem">
          {m.status == 0 && (
            <ListItemIcon className="jrnlIcon">
              <CircularProgress size={theme?.jrnlDrawer?.iconSize || 24} />
            </ListItemIcon>
          )}
          <ListItemIcon
            className={clsx(m.status === 1 ? "jrnlErrorIcon" : "jrnlIcon", { jrnlIconClickable: messagesClickable })}
            onClick={(e) => onShowMessages(e, m)}
          >
            {m.status === 1 ? <ErrorIcon /> : <CheckIcon />}
          </ListItemIcon>
          <ListItemText
            className={m.status === 1 ? "jrnlErrorItem" : "jrnlItem"}
            primary={m.clientMutationLabel}
            secondary={moment(m.requestDateTime).format("YYYY-MM-DD HH:mm")}
          />
          {!!m.clientMutationDetails && expanded === `detail-${idx}` && (
            <IconButton onClick={(e) => onToggleDetail(e, false)}>
              <ExpandLessIcon />
            </IconButton>
          )}
          {!!m.clientMutationDetails && expanded !== `detail-${idx}` && (
            <IconButton onClick={(e) => onToggleDetail(e, `detail-${idx}`)}>
              <ExpandMoreIcon />
            </IconButton>
          )}
        </ListItem>
        {!!m.clientMutationDetails && (
          <Collapse key={`mutation-detail${idx}`} in={expanded === `detail-${idx}`} timeout="auto" unmountOnExit>
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
    {!!hasNextPage && (
      <ListItem key="more" className="jrnlItem">
        <IconButton onClick={onLoadMore} className="jrnlIcon">
          <MoreIcon />
        </IconButton>
      </ListItem>
    )}
  </List>
);

const JournalButton = ({ mutations = [], onClick, formatMessage }) => {
  const processingCount = mutations.filter((m) => m.status === 0).length;
  const hasErrors = mutations.some((m) => m.status === 1);

  return (
    <Tooltip title={formatMessage("journal.tooltip")}>
      <IconButton
        color="inherit"
        onClick={onClick}
        aria-label={formatMessage("journal.tooltip")}
        sx={{
          mr: 2.5,
          ml: 0.5,
        }}
      >
        <Badge
          badgeContent={processingCount}
          color={hasErrors ? "error" : "secondary"}
          invisible={processingCount === 0}
          overlap="circular"
        >
          <HistoryIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

class JournalDrawer extends Component {
  constructor(props) {
    super(props);
    this.autoMessagesAnchorRef = React.createRef();
    this.autoHideMessagesTimeoutId = null;
    // mutations already final when first seen must not raise a stale popup on page reload
    this.announcedMutations = new Set((props.mutations ?? []).filter(isMutationFinal).map((m) => m.clientMutationId));
    this.state = {
      pageSize: props.modulesManager.getConf("fe-core", "journalDrawer.pageSize", 5),
      afterCursor: null,
      hasNextPage: false,
      displayedMutations: [],
      messagesAnchor: null,
      expanded: false,
      resultPopup: null,
      limitMutationLogsQuery: props.modulesManager.getConf("fe-core", "journalDrawer.limitMutationLogsQuery", false),
    };
  }

  componentDidMount() {
    if (!this.props.fetchedHistoricalMutations) {
      this.props.fetchHistoricalMutations(this.state.pageSize, null);
    }
    const timeoutId = setInterval(this.checkProcessing, 2000);
    this.setState((state) => ({
      timeoutId,
    }));
  }

  componentDidUpdate(prevProps) {
    const { journalSidebar } = this.props;

    if (journalSidebar && this.props.open && prevProps.open !== this.props.open) {
      this.hideMessages();
    }

    if (prevProps.fetchingHistoricalMutations && !this.props.fetchingHistoricalMutations) {
      this.props.mutations.filter(isMutationFinal).forEach((m) => this.announcedMutations.add(m.clientMutationId));
      this.setState((state, props) => ({
        displayedMutations: [...state.displayedMutations, ...props.mutations],
        afterCursor: props.mutationsPageInfo?.endCursor ?? null,
        hasNextPage: props.mutationsPageInfo?.hasNextPage ?? false,
      }));
    } else if (!_.isEqual(prevProps.mutations, this.props.mutations)) {
      this.setState({
        displayedMutations: [...this.props.mutations],
      });
      this.announceCompletedMutations(prevProps.mutations, this.props.mutations);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId);
    if (this.autoHideMessagesTimeoutId) {
      clearTimeout(this.autoHideMessagesTimeoutId);
      this.autoHideMessagesTimeoutId = null;
    }
  }

  /**
   * Mutations that just moved out of the "processing" state, each announced only once.
   */
  completedSince = (previousMutations, currentMutations) => {
    const previousById = new Map((previousMutations || []).map((mutation) => [mutation.clientMutationId, mutation]));
    return (currentMutations || []).filter((mutation) => {
      if (!isMutationFinal(mutation) || this.announcedMutations.has(mutation.clientMutationId)) {
        return false;
      }
      if (previousById.get(mutation.clientMutationId)?.status !== 0) {
        // never seen as processing: nothing completed under the user's eyes
        this.announcedMutations.add(mutation.clientMutationId);
        return false;
      }
      this.announcedMutations.add(mutation.clientMutationId);
      return true;
    });
  };

  announceCompletedMutations = (previousMutations, currentMutations) => {
    const completed = this.completedSince(previousMutations, currentMutations);
    if (!completed.length) {
      return;
    }
    const latest = completed[completed.length - 1];

    if (!this.props.journalSidebar) {
      this.setState({ resultPopup: latest });
      return;
    }

    // classic sidebar: briefly pop the message list next to the collapsed drawer
    if (this.props.open) {
      return;
    }
    const stableAnchor = this.autoMessagesAnchorRef.current;
    if (!stableAnchor) {
      return;
    }
    this.setState({
      messagesAnchor: stableAnchor,
      messages: latest,
    });
    if (this.autoHideMessagesTimeoutId) {
      clearTimeout(this.autoHideMessagesTimeoutId);
    }
    this.autoHideMessagesTimeoutId = setTimeout(() => {
      this.hideMessages();
      this.autoHideMessagesTimeoutId = null;
    }, 3000);
  };

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

  more = () => {
    this.props.fetchHistoricalMutations(this.state.pageSize, this.state.afterCursor);
  };

  showMessages = (e, m) => {
    // in the classic sidebar the expanded drawer already lists the messages
    if (this.props.journalSidebar && this.props.open) {
      return;
    }
    if (this.autoHideMessagesTimeoutId) {
      clearTimeout(this.autoHideMessagesTimeoutId);
      this.autoHideMessagesTimeoutId = null;
    }
    this.setState({
      messagesAnchor: e.currentTarget,
      messages: m,
    });
  };

  hideMessages = () => {
    if (this.autoHideMessagesTimeoutId) {
      clearTimeout(this.autoHideMessagesTimeoutId);
      this.autoHideMessagesTimeoutId = null;
    }
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

  hideResultPopup = () => {
    this.setState({ resultPopup: null });
  };

  openResultDetails = (event) => {
    const { resultPopup } = this.state;
    if (!resultPopup) {
      return;
    }
    this.setState({
      resultPopup: null,
      messagesAnchor: event.currentTarget,
      messages: resultPopup,
    });
  };

  renderMutations = (messagesClickable) => (
    <MutationList
      theme={this.props.theme}
      displayedMutations={this.state.displayedMutations}
      expanded={this.state.expanded}
      hasNextPage={this.state.hasNextPage}
      messagesClickable={messagesClickable}
      onShowMessages={this.showMessages}
      onToggleDetail={this.handleChange}
      onLoadMore={this.more}
    />
  );

  renderClassicSidebar() {
    const { open, handleDrawer } = this.props;
    return (
      <ClickAwayListener onClickAway={(e) => open && handleDrawer()}>
        <nav className="drawer">
          <span
            ref={this.autoMessagesAnchorRef}
            aria-hidden="true"
            style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 0 }}
          />
          <Messages anchorEl={this.state.messagesAnchor} messages={this.state.messages} onClick={this.hideMessages} />
          <Drawer
            variant="permanent"
            anchor="right"
            className={clsx("drawer", {
              drawerOpen: open,
              drawerClose: !open,
            })}
            classes={{
              paper: clsx({
                drawerOpen: open,
                drawerClose: !open,
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
            {this.renderMutations(!open)}
          </Drawer>
        </nav>
      </ClickAwayListener>
    );
  }

  renderPopupJournal() {
    const { open, handleDrawer, isMobile, formatMessage } = this.props;
    const { resultPopup } = this.state;
    const isError = resultPopup?.status === 1;

    return (
      <>
        <Messages anchorEl={this.state.messagesAnchor} messages={this.state.messages} onClick={this.hideMessages} />

        <Snackbar
          open={!!resultPopup}
          autoHideDuration={8000}
          onClose={this.hideResultPopup}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          className="resultSnackbar"
        >
          <Alert
            onClose={this.hideResultPopup}
            severity={isError ? "error" : "success"}
            variant="filled"
            sx={{ width: "100%", cursor: isError ? "pointer" : "default" }}
            onClick={isError ? this.openResultDetails : undefined}
          >
            <Typography variant="subtitle2" component="div">
              {resultPopup?.clientMutationLabel}
            </Typography>
            <Typography variant="body2" component="div">
              {isError ? formatMessage("journal.result.error") : formatMessage("journal.result.success")}
            </Typography>
          </Alert>
        </Snackbar>

        <Drawer
          variant="temporary"
          anchor={isMobile ? "bottom" : "right"}
          open={open}
          onClose={handleDrawer}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            className: isMobile ? "drawerPaperMobile" : "drawerPaperDesktop",
          }}
        >
          <Box className="drawerHeader">
            <Typography variant="subtitle1">{formatMessage("journal.title")}</Typography>
            <IconButton onClick={handleDrawer} aria-label="close">
              {isMobile ? <CloseIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ overflowY: "auto", flex: 1 }}>{this.renderMutations(true)}</Box>
        </Drawer>
      </>
    );
  }

  render() {
    return (
      <StyledJournalDrawer>
        {this.props.journalSidebar ? this.renderClassicSidebar() : this.renderPopupJournal()}
      </StyledJournalDrawer>
    );
  }
}

const mapStateToProps = (state) => ({
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
  const isNarrowViewport = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const isCoarsePointer = useMediaQuery("(pointer: coarse)", { noSsr: true });
  const isMobile = isNarrowViewport || isCoarsePointer;
  const { formatMessage } = useTranslations("core", props.modulesManager);

  return <JournalDrawer {...props} theme={theme} isMobile={isMobile} formatMessage={formatMessage} />;
};

const JournalButtonTrigger = withModulesManager(({ onClick, modulesManager }) => {
  const mutations = useSelector((state) => state.core.mutations);
  const { formatMessage } = useTranslations("core", modulesManager);
  return <JournalButton mutations={mutations} onClick={onClick} formatMessage={formatMessage} />;
});

export { StyledJournalDrawer };
export { Messages };
export { JournalButton };
export { JournalButtonTrigger };
export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(JournalDrawerWithTheme));
