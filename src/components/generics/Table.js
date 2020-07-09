import React, { Component, Fragment } from "react";
import classNames from "classnames";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    Typography, Divider, Box, IconButton,
    Table as MUITable, TableRow, TableHead, TableBody, TableCell, TableFooter, TablePagination
} from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
import withModulesManager from "../../helpers/modules";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";

const styles = theme => ({
    table: theme.table,
    tableTitle: theme.table.title,
    tableHeader: theme.table.header,
    tableRow: theme.table.row,
    tableCell: theme.table.cell,
    tableLockedRow: theme.table.lockedRow,
    tableLockedCell: theme.table.lockedCell,
    tableHighlightedRow: theme.table.highlightedRow,
    tableHighlightedCell: theme.table.highlightedCell,
    tableHighlightedAltRow: theme.table.highlightedAltRow,
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
    }
});

class Table extends Component {

    state = {
        selection: {}
    }

    _atom = (a) => !!a && a.reduce(
        (m, i) => { m[this.props.itemIdentifier(i)] = i; return m },
        {}
    )

    componentDidMount() {
        if (this.props.withSelection) {
            this.setState((state, props) => ({
                selection: this._atom(props.selection)
            }))
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.withSelection && prevProps.selectAll !== this.props.selectAll) {
            this.setState((state, props) => ({
                selection: _.merge(state.selection, this._atom(props.items))
            }),
                e => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection))
            )
        }
        if (this.props.withSelection && prevProps.clearAll !== this.props.clearAll) {
            this.setState(
                { selection: {} },
                e => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection))
            )
        }
    }

    isSelected = i => !!this.props.withSelection && !!this.state.selection[this.props.itemIdentifier(i)]

    select = i => {
        if (!this.props.withSelection) return;
        let s = this.state.selection;
        let id = this.props.itemIdentifier(i);
        if (!!s[id]) {
            delete (s[id]);
        } else {
            s[id] = i;
        }
        this.setState(
            { selection: s },
            e => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection))
        )

    }

    headerAction = a => <Box flexGrow={1}><Box display="flex" justifyContent="flex-end">{a()}</Box></Box>

    render() {
        const { intl, modulesManager, classes, module, header,
            preHeaders, headers, aligns = [], headerSpans = [], headerActions = [], colSpans = [],
            items, itemFormatters,
            rowHighlighted = null, rowHighlightedAlt = null, rowDisabled = null, rowLocked = null,
            withPagination = false, page, pageSize, count, rowsPerPageOptions = [10, 20, 50],
            onChangeRowsPerPage, onChangePage, onDoubleClick, onDelete = null } = this.props;
        var i = !!headers && headers.length
        let localHeaders = [...headers];
        let localPreHeaders = !!preHeaders ? [...preHeaders] : null;
        let localItemFormatters = [...itemFormatters];
        while (!!localHeaders && i--) {
            if (!!modulesManager && modulesManager.hideField(module, localHeaders[i])) {
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
            if (!!localPreHeaders) localPreHeaders.push("")
            localHeaders.push("")
            localItemFormatters.push(
                (i, idx) => idx === items.length - (withPagination ? 1 : 0) ?
                    null :
                    <IconButton onClick={e => onDelete(idx)}><DeleteIcon /></IconButton>
            );
        }
        return (
            <Fragment>
                {header &&
                    <Fragment>
                        <Typography className={classes.tableTitle}>
                            {header}
                        </Typography>
                        <Divider />
                    </Fragment>
                }
                <MUITable className={classes.table}>
                    {!!localPreHeaders && localPreHeaders.length > 0 && (
                        <TableHead>
                            <TableRow>
                                {localPreHeaders.map((h, idx) => {
                                    if (headerSpans.length > idx && !headerSpans[idx]) return null;
                                    return <TableCell
                                        colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                                        className={classes.tableHeader} key={`preh-${idx}`}>
                                        {!!h && h}
                                    </TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                    )}
                    {!!localHeaders && localHeaders.length > 0 && (
                        <TableHead>
                            <TableRow>
                                {localHeaders.map((h, idx) => {
                                    if (headerSpans.length > idx && !headerSpans[idx]) return null;
                                    return (<TableCell
                                        colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                                        className={classes.tableCell}
                                        key={`h-${idx}`}>
                                        {!!h && (
                                            <div style={{ width: '100%' }}>
                                                <Box display="flex" className={classes.tableHeader} alignItems="center">
                                                    <Box>
                                                        <FormattedMessage module={module} id={h} />
                                                    </Box>
                                                    {headerActions.length > idx ? this.headerAction(headerActions[idx]) : null}
                                                </Box>
                                            </div>
                                        )}
                                    </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {items && items.length > 0 && items.map((i, iidx) => (
                            <TableRow key={iidx}
                                selected={this.isSelected(i)}
                                onClick={e => this.select(i)}
                                onDoubleClick={e => !!onDoubleClick && onDoubleClick(i)}
                                className={classNames(
                                    classes.tableRow,
                                    !!rowLocked && rowLocked(i) ? classes.tableLockedRow : null,
                                    !!rowHighlighted && rowHighlighted(i) ? classes.tableHighlightedRow : null,
                                    !!rowHighlightedAlt && rowHighlightedAlt(i) ? classes.tableHighlightedAltRow : null,
                                    !!rowDisabled && rowDisabled(i) ? classes.tableDisabledRow : null,
                                )}
                            >
                                {localItemFormatters && localItemFormatters.map((f, fidx) => {
                                    if (colSpans.length > fidx && !colSpans[fidx]) return null;
                                    return (
                                        <TableCell
                                            colSpan={colSpans.length > fidx ? colSpans[fidx] : 1}
                                            className={classNames(
                                                classes.tableCell,
                                                !!rowLocked && rowLocked(i) ? classes.tableLockedCell : null,
                                                !!rowHighlighted && rowHighlighted(i) ? classes.tableHighlightedCell : null,
                                                !!rowHighlightedAlt && rowHighlightedAlt(i) ? classes.tableHighlightedAltCell : null,
                                                !!rowDisabled && rowDisabled(i) ? classes.tableDisabledCell : null,
                                                classes[`${aligns.length > fidx && !!aligns[fidx] ? aligns[fidx] : "left"}`]
                                            )}
                                            key={`v-${iidx}-${fidx}`}>
                                            {f(i, iidx)}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                    {!!withPagination && !!count && (
                        <TableFooter className={classes.tableFooter}>
                            <TableRow>
                                <TablePagination
                                    className={classes.pager}
                                    colSpan={localItemFormatters.length}
                                    labelRowsPerPage={formatMessage(intl, "core", "rowsPerPage")}
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${formatMessageWithValues(intl, "core", "ofPages")} ${count}`}
                                    count={count}
                                    page={page}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={rowsPerPageOptions}
                                    onChangeRowsPerPage={e => onChangeRowsPerPage(e.target.value)}
                                    onChangePage={onChangePage}
                                />
                            </TableRow>
                        </TableFooter>
                    )}
                </MUITable>
            </Fragment>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(
    withStyles(styles)(Table)
)));
