import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Paper, Divider, IconButton } from "@material-ui/core";
import { YoutubeSearchedFor as ResetFilterIcon, Search as DefaultSearchIcon } from "@material-ui/icons";
import FormattedMessage from "./FormattedMessage";
import { withTooltip, formatMessage } from "../../helpers/i18n";
import AdvancedFiltersDialog from "../dialogs/AdvancedFiltersDialog";

const styles = (theme) => ({
  paper: theme.paper.body,
  paperHeader: theme.paper.header,
  paperHeaderTitle: theme.paper.title,
  paperHeaderAction: theme.paper.action,
  paperDivider: theme.paper.divider,
});

class SearcherPane extends Component {
  render() {
    const {
      classes,
      module,
      del,
      title = "search.title",
      split = 8,
      filterPane,
      filters,
      resultsPane = null,
      reset,
      resetTooltip,
      refresh,
      refreshTooltip,
      actions,
      SearchIcon = null,
      isCustomFiltering = false,
      objectForCustomFiltering = null,
      moduleName = null,
      objectType = null,
      setAppliedCustomFilters = null,
      appliedCustomFilters = null,
      onChangeFilters,
      appliedFiltersRowStructure = null,
      setAppliedFiltersRowStructure = null,
      applyNumberCircle = null,
    } = this.props;
    return (
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item xs={split} className={classes.paperHeaderTitle}>
            <FormattedMessage module={module} id={title} />
          </Grid>
          <Grid item xs={12 - split} className={classes.paperHeader}>
            {(!!actions || !!refresh) && (
              <Grid container justify="flex-end">
                {isCustomFiltering === true ? (
                  <AdvancedFiltersDialog
                    object={objectForCustomFiltering}
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
                    <Grid item key={`action-${idx}`} className={classes.paperHeaderAction}>
                      <IconButton onClick={a.action}>{a.icon}</IconButton>
                    </Grid>
                  ))}
                {!!reset &&
                  withTooltip(
                    <Grid item key={`action-reset`} className={classes.paperHeaderAction}>
                      <IconButton onClick={reset}>
                        <ResetFilterIcon />
                      </IconButton>
                    </Grid>,
                    resetTooltip || formatMessage(this.props.intl, module, "resetFilterTooltip")
                  )}
                {!!refresh &&
                  withTooltip(
                    <Grid item key={`action-refresh`} className={classes.paperHeaderAction}>
                      <IconButton onClick={refresh}>{!!SearchIcon ? <SearchIcon /> : <DefaultSearchIcon />}</IconButton>
                    </Grid>,
                    refreshTooltip || formatMessage(this.props.intl, module, "refreshFilterTooltip")
                  )}
              </Grid>
            )}
          </Grid>
          {!!filterPane && (
            <Fragment>
              <Grid item xs={12} className={classes.paperDivider}>
                <Divider />
              </Grid>
              {filterPane}
            </Fragment>
          )}
          {!!resultsPane && (
            <Fragment>
              <Grid item xs={12} className={classes.paperDivider}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                {resultsPane}
              </Grid>
            </Fragment>
          )}
        </Grid>
      </Paper>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(SearcherPane)));
