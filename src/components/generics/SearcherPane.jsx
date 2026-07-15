import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid, Paper, Divider, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import GetIconComponent from "../../helpers/icons";
const ResetFilterIcon = GetIconComponent("YoutubeSearchedFor");
const DefaultSearchIcon = GetIconComponent("Search");

import SearcherActionButton from "./SearcherActionButton";
import { DEFAULT_DEBOUNCE_TIME, ENTER_KEY } from "../../constants";
import { formatMessage } from "../../helpers/i18n";
import AdvancedFiltersDialog from "../dialogs/AdvancedFiltersDialog";
import FormattedMessage from "./FormattedMessage";

const StyledSearcherPane = styled("div")(({ theme }) => ({
  "& .paper": {
    ...theme.paper?.body,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  "& .paperHeader": {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing?.(1),
    backgroundColor: "transparent",
    minHeight: "40px",
  },
  "& .paperHeaderTitle": {
    ...theme.paper?.title,
    backgroundColor: "transparent",
    padding: theme.spacing(0.5, 1),
    display: "flex",
    alignItems: "center",
    color: "inherit",
    minWidth: "auto",
    flexShrink: 0,
  },
  "& .paperHeaderRow": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: theme.paper?.header?.color || theme.palette.primary.main,
    ...theme.paper?.header,
    backgroundColor: theme.paper?.header?.backgroundColor || theme.palette.primary.light,
    minHeight: "32px",
    padding: theme.spacing(0.5, 1),
  },
  "& .paperHeaderAction": {
    ...theme.paper?.action,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  "& .paperDivider": theme.paper?.divider,
}));

class SearcherPane extends Component {
  constructor(props) {
    super(props);
    const { refresh = () => {}, reset = () => {} } = this.props;
    this.debouncedRefresh = _debounce(refresh, DEFAULT_DEBOUNCE_TIME);
    this.debouncedReset = _debounce(reset, DEFAULT_DEBOUNCE_TIME);
  }

  handleKeyDown = (event) => {
    if (event.key === ENTER_KEY) {
      if (!event.target.value) {
        this.debouncedRefresh();
      }
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const {
      module,
      del,
      title = "search.title",
      split = 8,
      filterPane,
      filters,
      resultsPane = null,
      reset,
      refresh,
      actions,
      isCustomFiltering = false,
      objectForCustomFiltering = null,
      additionalCustomFilterParams = null,
      moduleName = null,
      objectType = null,
      setAppliedCustomFilters = null,
      appliedCustomFilters = null,
      onChangeFilters,
      appliedFiltersRowStructure = null,
      setAppliedFiltersRowStructure = null,
      applyNumberCircle = null,
      ActionButton = SearcherActionButton,
    } = this.props;
    return (
      <StyledSearcherPane>
        <Paper className="paper">
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Grid container className="paperHeaderRow" wrap="nowrap" onKeyDown={this.handleKeyDown}>
              <Grid size={6} className="paperHeaderTitle">
                <FormattedMessage module={module} id={title} />
              </Grid>
              <Grid className="paperHeader">
                {(!!actions || !!refresh) && (
                  <>
                    {isCustomFiltering === true ? (
                      <AdvancedFiltersDialog
                        object={objectForCustomFiltering}
                        additionalParams={additionalCustomFilterParams}
                        moduleName={moduleName}
                        objectType={objectType}
                        setAppliedCustomFilters={setAppliedCustomFilters}
                        appliedCustomFilters={appliedCustomFilters}
                        onChangeFilters={onChangeFilters}
                        appliedFiltersRowStructure={appliedFiltersRowStructure}
                        setAppliedFiltersRowStructure={setAppliedFiltersRowStructure}
                        applyNumberCircle={applyNumberCircle}
                        searchCriteria={filters}
                        deleteFilter={del}
                      />
                    ) : (
                      <></>
                    )}
                    {!!actions &&
                      actions.map((a, idx) => (
                        <ActionButton
                          key={`action-${idx}`}
                          onClick={a.action}
                          startIcon={a.icon}
                          label={a.label || ""}
                        />
                      ))}
                    {!!reset && (
                      <ActionButton
                        key="action-reset"
                        startIcon={<ResetFilterIcon />}
                        onClick={this.debouncedReset}
                        label={formatMessage(this.props.intl, module, "resetFilterTooltip")}
                      />
                    )}
                    {!!refresh && (
                      <ActionButton
                        key="action-refresh"
                        startIcon={<DefaultSearchIcon />}
                        onClick={this.debouncedRefresh}
                        label={formatMessage(this.props.intl, module, "refreshFilterTooltip")}
                      />
                    )}
                  </>
                )}
              </Grid>
            </Grid>
            {!!filterPane && (
              <Fragment>
                <Grid size={12} className="paperDivider">
                  <Divider />
                </Grid>
                {filterPane}
              </Fragment>
            )}
            {!!resultsPane && (
              <Fragment>
                <Grid container className="paperDivider">
                  <Divider sx={{ width: "100%" }} />
                </Grid>
                <Grid container>{resultsPane}</Grid>
              </Fragment>
            )}
          </Box>
        </Paper>
      </StyledSearcherPane>
    );
  }
}

export { StyledSearcherPane };
export default injectIntl(SearcherPane);
