import React, { Component, Fragment } from "react";
import clsx from "clsx";
import { injectIntl } from "react-intl";
import _ from "lodash";
import GetIconComponent from "../../helpers/icons";

const DeleteIcon = GetIconComponent("Delete");
import { styled } from "@mui/material/styles";
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
} from "@mui/material";
import FormattedMessage from "./FormattedMessage";
import ProgressOrError from "./ProgressOrError";
import withModulesManager from "../../helpers/modules";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import TextInput from "../inputs/TextInput";
import NumberInput from "../inputs/NumberInput";
import AmountInput from "../inputs/AmountInput";

const StyledTableService = styled("div")(({ theme }) => ({
  "& .table": theme.table ?? {},
  "& .tableTitle": theme.table?.title,
  "& .tableHeader": theme.table?.header,
  "& .tableRow": theme.table?.row,
  "& .tableLockedRow": theme.table?.lockedRow,
  "& .tableLockedCell": theme.table?.lockedCell,
  "& .tableHighlightedRow": theme.table?.highlightedRow,
  "& .tableHighlightedCell": theme.table?.highlightedCell,
  "& .tableHighlightedAltRow": theme.table?.highlightedAltRow,
  "& .tableHighlightedAltCell": theme.table?.highlightedAltCell,
  "& .tableDisabledRow": theme.table?.disabledRow,
  "& .tableDisabledCell": theme.table?.disabledCell,
  "& .tableFooter": theme.table?.footer,
  "& .pager": theme.table?.pager,
  "& .left": {
    textAlign: "left",
  },
  "& .right": {
    textAlign: "right",
  },
  "& .center": {
    textAlign: "center",
  },
  "& .clickable": {
    cursor: "pointer",
  },
  "& .loader": {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0, 0, 0, 0.12)",
  },
}));

class Table extends Component {
  state = {
    selection: {},
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

  select = (i) => {
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
  };

  headerAction = (a) => (
    <Box flexGrow={1}>
      <Box display="flex" justifyContent="flex-end">
        {a()}
      </Box>
    </Box>
  );

  shouldShowSubServices = (i, iidx, formatters) => {
    const firstFormatterResult = formatters[0]?.(i, iidx);
    const value = firstFormatterResult?.props?.children?.props?.children?.props?.value;
    return value != undefined && value.packagetype != undefined && value.packagetype !== "S";
  };

  renderItemCells = (
    i,
    iidx,
    formatters,
    aligns,
    colSpans,
    rowLocked,
    rowHighlighted,
    rowHighlightedAlt,
    rowDisabled,
  ) =>
    formatters.map((f, fidx) => {
      if (colSpans.length > fidx && !colSpans[fidx]) return null;
      return (
        <TableCell
          colSpan={colSpans.length > fidx ? colSpans[fidx] : 1}
          className={clsx(
            !!rowLocked && rowLocked(i) ? "tableLockedCell" : null,
            !!rowHighlighted && rowHighlighted(i) ? "tableHighlightedCell" : null,
            !!rowHighlightedAlt && rowHighlightedAlt(i) ? "tableHighlightedAltCell" : null,
            !!rowDisabled && rowDisabled(i) ? "tableDisabledCell" : null,
            aligns.length > fidx && aligns[fidx],
          )}
          key={`v-${iidx}-${fidx}`}
        >
          {f(i, iidx)}
        </TableCell>
      );
    });

  renderSubServiceRows = (i, iidx, formatters) => {
    if (!formatters?.length) return null;
    return formatters.flatMap((formatter, sfidx) => {
      const rows = formatter(i, iidx);
      if (!rows) return [];
      const rowList = Array.isArray(rows) ? rows : [rows];
      return rowList
        .filter((row) => row?.props?.children)
        .map((row, rowIdx) => (
          <TableRow key={`sub-${iidx}-${sfidx}-${rowIdx}`}>{React.Children.toArray(row.props.children)}</TableRow>
        ));
    });
  };

  render() {
    const {
      intl,
      modulesManager,
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
      forReview,
      subServicesItemsFormatters,
      subServiceHeaders,
    } = this.props;
    let localHeaders = [...(headers || [])];
    let localSubServiceHeaders = [...(subServiceHeaders || [])];
    let localPreHeaders = !!preHeaders ? [...preHeaders] : null;
    let localItemFormatters = [...itemFormatters];
    let localSubServicesItemsFormatters = [...(subServicesItemsFormatters || [])];
    var i = !!headers && headers.length;
    var localForReview = forReview;
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
      localItemFormatters.push((i, idx) => (
        <IconButton onClick={(e) => onDelete(idx)}>
          <DeleteIcon />
        </IconButton>
      ));
    }

    const rowsPerPage = pageSize || rowsPerPageOptions[0];
    return (
      <StyledTableService>
        <Box position="relative" overflow="auto">
          {header && (
            <Fragment>
              <Typography className="tableTitle">{header}</Typography>
              <Divider />
            </Fragment>
          )}
          <MUITable className="table" size={size}>
            {!!localPreHeaders && localPreHeaders.length > 0 && (
              <TableHead>
                <TableRow>
                  {localPreHeaders.map((h, idx) => {
                    if (headerSpans.length > idx && !headerSpans[idx]) return null;
                    return (
                      <TableCell
                        colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                        className={clsx("tableHeader", aligns.length > idx && aligns[idx])}
                        key={`preh-${idx}`}
                      >
                        {!!h && h}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
            )}

            <TableBody>
              {items &&
                items.length > 0 &&
                items.map((i, iidx) => {
                  const showSubServices = this.shouldShowSubServices(i, iidx, localItemFormatters);

                  if (i.claimlinkedService != undefined) {
                    return (
                      <Fragment key={`row-${iidx}`}>
                        {iidx === 0 && (
                          <TableRow>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[0]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[1]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[2]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[3]} />
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          {this.renderItemCells(
                            i,
                            iidx,
                            localItemFormatters,
                            aligns,
                            colSpans,
                            rowLocked,
                            rowHighlighted,
                            rowHighlightedAlt,
                            rowDisabled,
                          )}
                        </TableRow>
                        {showSubServices && (
                          <Fragment>
                            <TableRow>
                              {localSubServiceHeaders.map((h, idx) => (
                                <TableCell key={`sub-header-${iidx}-${idx}`} className="tableHeader">
                                  <FormattedMessage module={module} id={h} />
                                </TableCell>
                              ))}
                            </TableRow>
                            {this.renderSubServiceRows(i, iidx, localSubServicesItemsFormatters)}
                          </Fragment>
                        )}
                      </Fragment>
                    );
                  }

                  const cleanedHeaders = localHeaders.filter(Boolean);
                  return (
                    <Fragment key={`row-${iidx}`}>
                      {iidx === 0 && cleanedHeaders.length > 0 && (
                        <TableRow>
                          {cleanedHeaders.map((header, index) => (
                            <TableCell key={`header-${index}`} className="tableHeader">
                              <FormattedMessage module={module} id={header} />
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                      <TableRow>
                        {this.renderItemCells(
                          i,
                          iidx,
                          localItemFormatters,
                          aligns,
                          colSpans,
                          rowLocked,
                          rowHighlighted,
                          rowHighlightedAlt,
                          rowDisabled,
                        )}
                      </TableRow>
                      {showSubServices && (
                        <TableRow>
                          <TableCell colSpan={cleanedHeaders.length || 1}>
                              <TableRow>
                                {localSubServiceHeaders.map((h, idx) => (
                                  <TableCell 
                                  key={`sub-header-${iidx}-${idx}`} className="tableHeader">
                                    <FormattedMessage module={module} id={h} />
                                  </TableCell>
                                ))}
                              </TableRow>
                            {this.renderSubServiceRows(i, iidx, localSubServicesItemsFormatters)}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
            </TableBody>

            {!!withPagination && !!count && (
              <TableFooter className="tableFooter">
                <TableRow>
                  <TablePagination
                    className="pager"
                    colSpan={localItemFormatters.length}
                    labelRowsPerPage={formatMessage(intl, "core", "rowsPerPage")}
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} ${formatMessageWithValues(intl, "core", "ofPages")} ${count}`
                    }
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
            <Grid className="loader" container justifyContent="center" alignItems="center">
              <ProgressOrError progress={items?.length && fetching} error={error} />{" "}
              {/* We do not want to display the spinner with the empty table */}
            </Grid>
          )}
        </Box>
      </StyledTableService>
    );
  }
}

export { StyledTableService };
export default withModulesManager(injectIntl(Table));
