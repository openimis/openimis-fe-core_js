import React, { Component } from "react";
import clsx from "clsx";
import { injectIntl } from "react-intl";
import _ from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Divider,
  Box,
  IconButton,
  Table as MUITable,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  Grid,
  TablePagination,
  Checkbox,
} from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
import ProgressOrError from "./ProgressOrError";
import withModulesManager from "../../helpers/modules";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import { parseData } from "../../helpers/api";

const styles = (theme) => ({
  table: theme.table,
  tableTitle: theme.table.title,
  tableHeader: theme.table.header,
  tableRow: theme.table.row,
  tableLockedRow: theme.table.lockedRow,
  tableLockedCell: theme.table.lockedCell,
  tableHighlightedRow: theme.table.highlightedRow,
  tableHighlightedCell: theme.table.highlightedCell,
  tableHighlightedAltRow: theme.table.highlightedAltRow,
  tableSecondaryHighlightedRow: theme.table.secondaryHighlightedRow,
  tableSecondaryHighlightedCell: theme.table.secondaryHighlightedCell,
  tableHighlightedAltCell: theme.table.highlightedAltCell,
  tableDisabledRow: theme.table.disabledRow,
  tableDisabledCell: theme.table.disabledCell,
  tableFooter: theme.table.footer,
  pager: theme.table.pager,
  left: {
    textAlign: "left",
  },
  right: {
    textAlign: "right",
  },
  center: {
    textAlign: "center",
  },
  clickable: {
    cursor: "pointer",
  },
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0, 0, 0, 0.12)",
  },
});

class Table extends Component {
  state = {
    selection: {},
    ordinalNumberFrom: null,
  };

  _atom = (a) =>
    !!a &&
    a.reduce((m, i) => {
      m[this.itemIdentifier(i)] = i;
      return m;
    }, {});

  componentDidMount() {
    if (this.props.withSelection) {
      this.setState((state, props) => ({
        selection: this._atom(props.selection || []),
      }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.withSelection && prevProps.selectAll !== this.props.selectAll) {
      this.setState(
        (state, props) => ({
          selection: _.merge(state.selection, this._atom(props.items)),
        }),
        (e) => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
      );
    }
    if (this.props.withSelection && prevProps.clearAll !== this.props.clearAll) {
      this.setState(
        { selection: {} },
        (e) => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
      );
    }
  }

  itemIdentifier = (i) => {
    if (!!this.props.itemIdentifier) {
      return this.props.itemIdentifier(i);
    } else {
      return i.uuid;
    }
  };

  isSelected = (i) => !!this.props.withSelection && !!this.state.selection[this.itemIdentifier(i)];

  select = (i, e) => {
    // block normal href only for left click
    if (e.type === "click" || this.props.selectWithCheckbox) {
      if (!this.props.withSelection) return;
      let s = this.state.selection;
      let id = this.itemIdentifier(i);
      if (!!s[id]) {
        delete s[id];
      } else if (this.props.withSelection === "multiple") {
        s[id] = i;
      } else {
        s = { [id]: i };
      }
      this.setState(
        { selection: s },
        (e) => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
      );
    }
  };

  selectAll = async () => {
    const { withSelection, getAllItems, onChangeSelection } = this.props;
    const { selection } = this.state;
  
    if (!withSelection) return;
  
    let newSelection = {};

    if (!Object.keys(selection).length) {
      const itemsData = await getAllItems();
      const items = parseData(itemsData.payload.data.worker);
      newSelection = this._atom(items);
    }
  
    this.setState({ selection: newSelection }, () => {
      onChangeSelection?.(Object.values(this.state.selection));
    });
  };

  headerAction = (a) => (
    <Box flexGrow={1}>
      <Box display="flex" justifyContent="flex-end">
        {a()}
      </Box>
    </Box>
  );

  calculateOrdinalNumber = (iidx, isPaginationEnabled, arrayLength) => {
    const { ordinalNumberFrom } = this.state;
    let currentIndex = 0;
    if (isPaginationEnabled) {
      if (isNaN(ordinalNumberFrom)) {
        currentIndex = 0;
      }
      currentIndex = iidx + ordinalNumberFrom;
    } else {
      currentIndex = iidx + 1;
    }
    return currentIndex;
  };

  render() {
    const {
      intl,
      modulesManager,
      classes,
      module,
      header,
      preHeaders,
      headers,
      aligns = [],
      headerSpans = [],
      headerActions = [],
      colSpans = [],
      items,
      itemFormatters,
      rowHighlighted = null,
      rowHighlightedAlt = null,
      rowSecondaryHighlighted = null,
      rowDisabled = null,
      rowLocked = null,
      withPagination = false,
      page = 0,
      pageSize,
      count,
      size,
      rowsPerPageOptions = [10, 20, 50],
      onChangeRowsPerPage,
      onChangePage,
      onDoubleClick,
      onDelete = null,
      fetching = null,
      error = null,
      showOrdinalNumber = false,
      extendHeader,
      disableDeleteOnEmptyRow = false,
      selectWithCheckbox = false,
      withSelection = false,
    } = this.props;
    const { ordinalNumberFrom } = this.state;
    let localHeaders = [...(headers || [])];
    let localPreHeaders = !!preHeaders ? [...preHeaders] : null;
    let localItemFormatters = [...itemFormatters];
    var i = !!headers && headers.length;
    while (localHeaders && i--) {
      if (modulesManager?.hideField(module, localHeaders[i])) {
        if (!!localPreHeaders) localPreHeaders.splice(i, 1);
        if (!!aligns && aligns.length > i) aligns.splice(i, 1);
        if (!!headerSpans && headerSpans.length > i) headerSpans.splice(i, 1);
        if (!!headerActions && headerActions.length > i) headerActions.splice(i, 1);
        if (!!colSpans && colSpans.length > i) colSpans.splice(i, 1);
        localHeaders.splice(i, 1);
        localItemFormatters.splice(i, 1);
      }
    }

    if (!!onDelete) {
      if (localPreHeaders) localPreHeaders.push("");
      localHeaders.push("");
      localItemFormatters.push((i, idx) => {
        const isEmpty = disableDeleteOnEmptyRow ? _.isEmpty(i) : false;
        return (
          <IconButton disabled={isEmpty} onClick={(e) => onDelete(idx)}>
            <DeleteIcon />
          </IconButton>
        );
      });
    }

    const rowsPerPage = pageSize || rowsPerPageOptions[0];
    const numSelected = Object.keys(this.state.selection || {}).length;

    if (showOrdinalNumber) {
      localHeaders.unshift("core.Table.ordinalNumberHeader");
    }
    return (
      <Box position="relative" overflow="auto">
        {header && (
          <Grid container alignItems="center" justify="space-between" className={classes.tableTitle}>
            {extendHeader ? (
              <>
                <Grid item xs={6}>
                  <Typography variant="h6">{header}</Typography>
                </Grid>
                <Grid item container direction="row" alignItems="center" justify="space-between" xs={6}>
                  {extendHeader && extendHeader()}
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6">{header}</Typography>
              </Grid>
            )}
          </Grid>
        )}
        <Divider />
        <MUITable className={classes.table} size={size}>
          {!!localPreHeaders && localPreHeaders.length > 0 && (
            <TableHead>
              <TableRow>
                {localPreHeaders.map((h, idx) => {
                  if (headerSpans.length > idx && !headerSpans[idx]) return null;
                  return (
                    <TableCell
                      colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                      className={clsx(classes.tableHeader, aligns.length > idx && classes[aligns[idx]])}
                      key={`preh-${idx}`}
                    >
                      {!!h && h}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
          )}
          {!!localHeaders && localHeaders.length > 0 && (
            <TableHead>
              <TableRow>
                {selectWithCheckbox && withSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={numSelected > 0 && numSelected < count}
                      checked={count > 0 && numSelected === count}
                      onChange={(e) => this.selectAll(e)}
                    />
                  </TableCell>
                )}
                {localHeaders.map((h, idx) => {
                  if (headerSpans.length > idx && !headerSpans[idx]) return null;
                  return (
                    <TableCell colSpan={headerSpans.length > idx ? headerSpans[idx] : 1} key={`h-${idx}`}>
                      {!!h && (
                        <Box
                          style={{
                            width: "100%",
                            cursor: headerActions.length > idx && !!headerActions[idx][0] ? "pointer" : "",
                          }}
                          onClick={headerActions.length > idx ? headerActions[idx][0] : null}
                          display="flex"
                          className={classes.tableHeader}
                          alignItems="center"
                          justifyContent={aligns.length > idx ? aligns[idx] : "left"}
                        >
                          <Box>
                            {typeof h === "function" ? (
                              <Box>{() => h(this.state, this.props)}</Box>
                            ) : (
                              <FormattedMessage module={module} id={h} />
                            )}
                          </Box>
                          {headerActions.length > idx ? this.headerAction(headerActions[idx][1]) : null}
                        </Box>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {items &&
              items.length > 0 &&
              items.map((i, iidx) => (
                <TableRow
                  key={iidx}
                  selected={this.isSelected(i)}
                  onClick={(e) => !selectWithCheckbox && this.select(i, e)}
                  onContextMenu={onDoubleClick ? () => onDoubleClick(i, true) : undefined}
                  onDoubleClick={onDoubleClick ? () => onDoubleClick(i) : undefined}
                  className={clsx(
                    classes.tableRow,
                    !!rowLocked && rowLocked(i) ? classes.tableLockedRow : null,
                    !!rowHighlighted && rowHighlighted(i) ? classes.tableHighlightedRow : null,
                    !!rowHighlightedAlt && rowHighlightedAlt(i) ? classes.tableHighlightedAltRow : null,
                    !!rowSecondaryHighlighted && rowSecondaryHighlighted(i)
                      ? classes.tableSecondaryHighlightedRow
                      : null,
                    !!rowDisabled && rowDisabled(i) ? classes.tableDisabledRow : null,
                    !!onDoubleClick && classes.clickable,
                  )}
                >
                  {selectWithCheckbox && withSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox checked={this.isSelected(i)} onChange={(e) => this.select(i, e)} color="primary" />
                    </TableCell>
                  )}
                  {showOrdinalNumber && (
                    <TableCell
                      className={clsx(
                        !!rowLocked && rowLocked(i) ? classes.tableLockedCell : null,
                        !!rowHighlighted && rowHighlighted(i) ? classes.tableHighlightedCell : null,
                        !!rowHighlightedAlt && rowHighlightedAlt(i) ? classes.tableHighlightedAltCell : null,
                        !!rowSecondaryHighlighted && rowSecondaryHighlighted(i)
                          ? classes.tableSecondaryHighlightedCell
                          : null,
                        !!rowDisabled && rowDisabled(i) ? classes.tableDisabledCell : null,
                        aligns.length > 0 && classes[aligns[0]],
                      )}
                      key={`v-${this.calculateOrdinalNumber(iidx, withPagination, items.length)}-0`}
                    >
                      <span>{this.calculateOrdinalNumber(iidx, withPagination, items.length)}</span>
                    </TableCell>
                  )}
                  {localItemFormatters &&
                    localItemFormatters.map((f, fidx) => {
                      if (colSpans.length > fidx && !colSpans[fidx]) return null;
                      // NOTE: The 'f' function can explicitly be set to null, enabling the option to omit
                      // a column  and suppress its display under specific conditions.
                      if (f === null) return null;
                      return (
                        <TableCell
                          colSpan={colSpans.length > fidx ? colSpans[fidx] : 1}
                          className={clsx(
                            !!rowLocked && rowLocked(i) ? classes.tableLockedCell : null,
                            !!rowHighlighted && rowHighlighted(i) ? classes.tableHighlightedCell : null,
                            !!rowHighlightedAlt && rowHighlightedAlt(i) ? classes.tableHighlightedAltCell : null,
                            !!rowSecondaryHighlighted && rowSecondaryHighlighted(i)
                              ? classes.tableSecondaryHighlightedCell
                              : null,
                            !!rowDisabled && rowDisabled(i) ? classes.tableDisabledCell : null,
                            aligns.length > fidx && classes[aligns[fidx]],
                          )}
                          key={`v-${iidx}-${fidx}`}
                        >
                          {f(i, iidx)}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))}
          </TableBody>
          {!!withPagination && !!count && (
            <TableFooter className={classes.tableFooter}>
              <TableRow>
                <TablePagination
                  className={classes.pager}
                  colSpan={localItemFormatters.length + (selectWithCheckbox ? 1 : 0)}
                  labelRowsPerPage={formatMessage(intl, "core", "rowsPerPage")}
                  labelDisplayedRows={({ from, to, count }) => {
                    if (this.state.ordinalNumberFrom !== from) this.setState({ ordinalNumberFrom: from });
                    return `${from}-${to} ${formatMessageWithValues(intl, "core", "ofPages")} ${count}`;
                  }}
                  count={count}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onRowsPerPageChange={(e) => onChangeRowsPerPage(e.target.value)}
                  onPageChange={onChangePage}
                />
              </TableRow>
            </TableFooter>
          )}
        </MUITable>
        {(fetching || error) && (
          <Grid className={classes.loader} container justifyContent="center" alignItems="center">
            <ProgressOrError progress={items?.length && fetching} error={error} />{" "}
            {/* We do not want to display the spinner with the empty table */}
          </Grid>
        )}
      </Box>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(Table))));
