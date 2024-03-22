import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";

import { Grid, Paper, Divider, IconButton, Typography, Button } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { YoutubeSearchedFor as ResetFilterIcon, Search as DefaultSearchIcon } from "@material-ui/icons";

import { formatMessage } from "../../helpers/i18n";
import AdvancedFiltersDialog from "../dialogs/AdvancedFiltersDialog";
import FormattedMessage from "./FormattedMessage";

const styles = (theme) => ({
  paper: theme.paper.body,
  paperHeader: { ...theme.paper.header, display: "flex", justifyContent: "flex-end", itemAlign: "center" },
  paperHeaderTitle: theme.paper.title,
  paperHeaderAction: { ...theme.paper.action, display: "flex", justifyContent: "center", itemAlign: "center" },
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
    } = this.props;
    return (
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item xs={split} className={classes.paperHeaderTitle}>
            <FormattedMessage module={module} id={title} />
          </Grid>
          <Grid item xs={12 - split} className={classes.paperHeader}>
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
                    <Grid item key={`action-${idx}`} className={classes.paperHeaderAction}>
                      <IconButton onClick={a.action}>{a.icon}</IconButton>
                    </Grid>
                  ))}
                {!!reset && (
                  <Grid item key={`action-reset`} className={classes.paperHeaderAction}>
                    <Button variant="outlined" style={{ border: 0 }} onClick={reset} startIcon={<ResetFilterIcon />}>
                      <Typography variant="subtitle1">
                        {formatMessage(this.props.intl, module, "resetFilterTooltip")}
                      </Typography>
                    </Button>
                  </Grid>
                )}
                {!!refresh && (
                  <Grid item key={`action-refresh`} className={classes.paperHeaderAction}>
                    <Button variant="outlined" style={{ border: 0 }} onClick={reset} startIcon={<DefaultSearchIcon />}>
                      <Typography variant="subtitle1">
                        {formatMessage(this.props.intl, module, "refreshFilterTooltip")}
                      </Typography>
                    </Button>
                  </Grid>
                )}
              </>
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
