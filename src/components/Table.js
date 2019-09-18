import React, { Component, Fragment } from "react";
import classNames from "classnames";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Typography, Divider, Table as MUITable, TableRow, TableHead, TableBody, TableCell, TableFooter, TablePagination } from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
import withModulesManager from "../helpers/modules";
import { formatMessage, formatMessageWithValues } from "../helpers/i18n";

const styles = theme => ({
    tableTitle: theme.table.title,
    tableHeader: theme.table.header,
    tableRow: theme.table.row,
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
            this.setState({
                selection: this._atom(this.props.selection)
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.withSelection && prevProps.selectAll !== this.props.selectAll) {
            this.setState(
                { selection: _.merge(this.state.selection, this._atom(this.props.items)) },
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

    render() {
        const { intl, modulesManager, classes, module, header, headerValues = {}, preHeaders, headers, aligns = [], headerSpans = [], colSpans = [],
            items, itemFormatters,
            withPagination = false, page, pageSize, count, rowsPerPageOptions = [10, 20, 50],
            onChangeRowsPerPage, onChangePage, onDoubleClick } = this.props;
        var i = !!headers && headers.length
        while (!!headers && i--) {
            if (modulesManager.skipControl(module, headers[i])) {
                if (!!preHeaders) preHeaders.splice(i, 1);
                headers.splice(i, 1);
                itemFormatters.splice(i, 1);
            }
        }
        return (
            <Fragment>
                {header &&
                    <Fragment>
                        <Typography className={classes.tableTitle}>
                            <FormattedMessage module={module} id={header} values={headerValues} />
                        </Typography>
                        <Divider />
                    </Fragment>
                }
                <MUITable className={classes.table} size="small">
                    {!!preHeaders && preHeaders.length > 0 && (
                        <TableHead>
                            <TableRow>
                                {preHeaders.map((h, idx) => {
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
                    {!!headers && headers.length > 0 && (
                        <TableHead>
                            <TableRow>
                                {headers.map((h, idx) => {
                                    if (headerSpans.length > idx && !headerSpans[idx]) return null;
                                    return (<TableCell
                                        colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                                        className={classes.tableHeader} key={`h-${idx}`}>
                                        {!!h && <FormattedMessage module={module} id={h} />}
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
                            >
                                {itemFormatters && itemFormatters.map((f, fidx) => {
                                    if (colSpans.length > fidx && !colSpans[fidx]) return null;
                                    return (
                                        <TableCell
                                            colSpan={colSpans.length > fidx ? colSpans[fidx] : 1}
                                            className={classNames(
                                                classes.tableRow,
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
                    {!!withPagination && (
                        <TableFooter className={classes.tableFooter}>
                            <TableRow>
                                <TablePagination
                                    className={classes.pager}
                                    colSpan={itemFormatters.length}
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
