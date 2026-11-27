import React, { Component, Fragment } from "react";
import clsx from "clsx";
import merge from "lodash/merge";
import { styled } from "@mui/material/styles";
import {
  Typography,
  Divider,
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
 * title, the pager and the loader. Each renders its own body.
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

/*
 * The row selection both tables keep: seeded from `selection`, extended by
 * `selectAll`, emptied by `clearAll`, reported through `onChangeSelection`.
 */
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
          selection: merge(state.selection, this._atom(props.items)),
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

  itemIdentifier = (i) => (this.props.itemIdentifier ? this.props.itemIdentifier(i) : i.uuid);
}

// Removes the columns the modules manager hides. Like before, the aligns / spans
// arrays given as props are trimmed in place to stay aligned with the columns left.
const withoutHiddenColumns = (props, columns) => {
  const { modulesManager, module, aligns = [], headerSpans = [], headerActions = [], colSpans = [] } = props;
  const { localHeaders, localPreHeaders, localItemFormatters } = columns;
  const spans = [aligns, headerSpans, headerActions, colSpans];
  for (let i = localHeaders.length - 1; i >= 0; i--) {
    if (modulesManager?.hideField(module, localHeaders[i])) {
      localPreHeaders?.splice(i, 1);
      spans.filter((a) => a.length > i).forEach((a) => a.splice(i, 1));
      localHeaders.splice(i, 1);
      localItemFormatters.splice(i, 1);
    }
  }
  return { aligns, headerSpans, colSpans };
};

// Adds the delete action as a last column.
const addDeleteColumn = (onDelete, { localHeaders, localPreHeaders, localItemFormatters }) => {
  localPreHeaders?.push("");
  localHeaders.push("");
  localItemFormatters.push((item, idx) => (
    <IconButton onClick={() => onDelete(idx)}>
      <DeleteIcon />
    </IconButton>
  ));
};

/* The columns to render, once the hidden ones are removed and the delete action added. */
const serviceTableColumns = (props) => {
  const { preHeaders, headers, itemFormatters, onDelete = null, subServiceHeaders, pageSize } = props;
  const { rowsPerPageOptions = [10, 20, 50] } = props;
  const columns = {
    localHeaders: [...(headers || [])],
    localPreHeaders: preHeaders ? [...preHeaders] : null,
    localItemFormatters: [...itemFormatters],
  };
  const spans = withoutHiddenColumns(props, columns);
  if (onDelete) addDeleteColumn(onDelete, columns);
  return {
    ...spans,
    ...columns,
    localSubServiceHeaders: [...(subServiceHeaders || [])],
    rowsPerPage: pageSize || rowsPerPageOptions[0],
  };
};

/* The cells of item `i`, styled after the row state predicates given as props. */
const renderServiceItemCells = (props, i, iidx, formatters, aligns, colSpans) => {
  const { rowHighlighted = null, rowHighlightedAlt = null, rowDisabled = null, rowLocked = null } = props;
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

const ServiceTableTitle = ({ header }) =>
  header ? (
    <Fragment>
      <Typography className="tableTitle">{header}</Typography>
      <Divider />
    </Fragment>
  ) : null;

const ServiceTablePager = ({
  intl,
  colSpan,
  rowsPerPage,
  withPagination = false,
  page = 0,
  count,
  rowsPerPageOptions = [10, 20, 50],
  onChangeRowsPerPage,
  onChangePage,
}) =>
  withPagination && count ? (
    <TableFooter className="tableFooter">
      <TableRow>
        <TablePagination
          className="pager"
          colSpan={colSpan}
          labelRowsPerPage={formatMessage(intl, "core", "rowsPerPage")}
          labelDisplayedRows={({ from, to, count: total }) =>
            `${from}-${to} ${formatMessageWithValues(intl, "core", "ofPages")} ${total}`
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
  ) : null;

const ServiceTableLoader = ({ items, fetching = null, error = null }) =>
  fetching || error ? (
    <Grid className="loader" container sx={{ justifyContent: "center", alignItems: "center" }}>
      <ProgressOrError progress={items?.length && fetching} error={error} />{" "}
      {/* We do not want to display the spinner with the empty table */}
    </Grid>
  ) : null;

export {
  StyledServiceTable,
  serviceTableColumns,
  renderServiceItemCells,
  ServiceTableTitle,
  ServiceTablePager,
  ServiceTableLoader,
};
export default ServiceTableBase;
