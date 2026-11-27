import React, { Component, Fragment } from "react";
import clsx from "clsx";
import _ from "lodash";
import { styled } from "@mui/material/styles";
import {
  Typography,
  Divider,
  Box,
  IconButton,
  TableRow,
  TableCell,
  TableFooter,
  Grid,
  TablePagination,
} from "@mui/material";
import GetIconComponent from "../../helpers/icons";
import ProgressOrError from "./ProgressOrError";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";

const DeleteIcon = GetIconComponent("Delete");

/*
 * What TableService and TableServiceReview have in common: the styles, the row
 * selection, the column set (hidden fields, delete action), the item cells, the
 * title, the pager and the loader. Each subclass renders its own body.
 */
const StyledServiceTable = styled("div")(({ theme }) => ({
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

class ServiceTableBase extends Component {
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

  componentDidUpdate(prevProps) {
    if (this.props.withSelection && prevProps.selectAll !== this.props.selectAll) {
      this.setState(
        (state, props) => ({
          selection: _.merge(state.selection, this._atom(props.items)),
        }),
        () => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
      );
    }
    if (this.props.withSelection && prevProps.clearAll !== this.props.clearAll) {
      this.setState(
        { selection: {} },
        () => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
      );
    }
  }

  itemIdentifier = (i) => {
    if (this.props.itemIdentifier) {
      return this.props.itemIdentifier(i);
    }
    return i.uuid;
  };

  isSelected = (i) => !!this.props.withSelection && !!this.state.selection[this.itemIdentifier(i)];

  select = (i) => {
    if (!this.props.withSelection) return;
    let s = this.state.selection;
    const id = this.itemIdentifier(i);
    if (s[id]) {
      delete s[id];
    } else if (this.props.withSelection === "multiple") {
      s[id] = i;
    } else {
      s = { [id]: i };
    }
    this.setState(
      { selection: s },
      () => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection)),
    );
  };

  headerAction = (a) => (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>{a()}</Box>
    </Box>
  );

  /*
   * The columns left once the fields the modules manager hides are removed, plus the
   * delete action. Like before, the aligns / spans arrays given as props are trimmed
   * in place so that they stay aligned with the remaining columns.
   */
  columns = () => {
    const {
      modulesManager,
      module,
      preHeaders,
      headers,
      aligns = [],
      headerSpans = [],
      headerActions = [],
      colSpans = [],
      itemFormatters,
      onDelete = null,
      subServiceHeaders,
      pageSize,
      rowsPerPageOptions = [10, 20, 50],
    } = this.props;
    const localHeaders = [...(headers || [])];
    const localPreHeaders = preHeaders ? [...preHeaders] : null;
    const localItemFormatters = [...itemFormatters];
    let i = !!headers && headers.length;
    while (localHeaders && i--) {
      if (modulesManager?.hideField(module, localHeaders[i])) {
        if (localPreHeaders) localPreHeaders.splice(i, 1);
        if (aligns.length > i) aligns.splice(i, 1);
        if (headerSpans.length > i) headerSpans.splice(i, 1);
        if (headerActions.length > i) headerActions.splice(i, 1);
        if (colSpans.length > i) colSpans.splice(i, 1);
        localHeaders.splice(i, 1);
        localItemFormatters.splice(i, 1);
      }
    }
    if (onDelete) {
      if (localPreHeaders) localPreHeaders.push("");
      localHeaders.push("");
      localItemFormatters.push((item, idx) => (
        <IconButton onClick={() => onDelete(idx)}>
          <DeleteIcon />
        </IconButton>
      ));
    }
    return {
      aligns,
      headerSpans,
      colSpans,
      localHeaders,
      localPreHeaders,
      localItemFormatters,
      localSubServiceHeaders: [...(subServiceHeaders || [])],
      rowsPerPage: pageSize || rowsPerPageOptions[0],
    };
  };

  renderItemCells = (i, iidx, formatters, aligns, colSpans) => {
    const { rowHighlighted = null, rowHighlightedAlt = null, rowDisabled = null, rowLocked = null } = this.props;
    return formatters.map((f, fidx) => {
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
  };

  renderTitle = () =>
    this.props.header && (
      <Fragment>
        <Typography className="tableTitle">{this.props.header}</Typography>
        <Divider />
      </Fragment>
    );

  renderPager = (colSpan, rowsPerPage) => {
    const {
      intl,
      withPagination = false,
      page = 0,
      count,
      rowsPerPageOptions = [10, 20, 50],
      onChangeRowsPerPage,
      onChangePage,
    } = this.props;
    return (
      !!withPagination &&
      !!count && (
        <TableFooter className="tableFooter">
          <TableRow>
            <TablePagination
              className="pager"
              colSpan={colSpan}
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
      )
    );
  };

  renderLoader = () => {
    const { items, fetching = null, error = null } = this.props;
    return (
      (fetching || error) && (
        <Grid className="loader" container sx={{ justifyContent: "center", alignItems: "center" }}>
          <ProgressOrError progress={items?.length && fetching} error={error} />{" "}
          {/* We do not want to display the spinner with the empty table */}
        </Grid>
      )
    );
  };
}

export { StyledServiceTable };
export default ServiceTableBase;
