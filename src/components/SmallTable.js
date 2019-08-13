import React, { Component, Fragment } from "react";
import classNames from "classnames";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Typography, Divider, Table, TableRow, TableHead, TableBody, TableCell, TableFooter, TablePagination } from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
import withModulesManager from "../helpers/modules";
import { formatMessage } from "../helpers/i18n";

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

class SmallTable extends Component {

    state = {
        selection: {}
    }

    _atom = (a) => a.reduce(
        (m, i) => { m[this.props.itemIdentifier(i)] = i; return m },
        {}
    )

    componentDidMount() {
        this.setState({
            selection: this._atom(this.props.selection)
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectAll !== this.props.selectAll) {
            this.setState(
                { selection: _.merge(this.state.selection, this._atom(this.props.items)) },
                e => !!this.props.onChangeSelection && this.props.onChangeSelection(Object.values(this.state.selection))
            )
        }
        if (prevProps.clearAll !== this.props.clearAll) {
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
        const { intl, modulesManager, classes, module, header, headers, aligns = [], items, itemFormatters,
            withPagination = false, page, pageSize, count, rowsPerPageOptions = [10, 20, 50],
            onChangeRowsPerPage, onChangePage, onDoubleClick } = this.props;
        var i = !!headers && headers.length
        while (!!headers && i--) {
            if (modulesManager.skipControl(module, headers[i])) {
                headers.splice(i, 1);
                itemFormatters.splice(i, 1);
            }
        }
        return (
            <Fragment>
                {header &&
                    <Fragment>
                        <Typography className={classes.tableTitle}>
                            <FormattedMessage module={module} id={header} />
                        </Typography>
                        <Divider />
                    </Fragment>
                }
                <Table className={classes.table} size="small">
                    {!!headers && (
                        <TableHead>
                            <TableRow>
                                {headers.map((h, idx) => (
                                    <TableCell className={classes.tableHeader} key={`h-${idx}`}>
                                        <FormattedMessage module={module} id={h} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {items && items.map((i, iidx) => (
                            <TableRow key={iidx}
                                selected={this.isSelected(i)}
                                onClick={e => this.select(i)}
                                onDoubleClick={e => onDoubleClick(i)}
                            >
                                {itemFormatters && itemFormatters.map((f, fidx) => (
                                    <TableCell
                                        className={classNames(
                                            classes.tableRow,
                                            classes[`${aligns.length > fidx && !!aligns[fidx] ? aligns[fidx] : "left"}`]
                                        )}
                                        key={`v-${iidx}-${fidx}`}>
                                        {f(i)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                    {!!withPagination && (
                        <TableFooter className={classes.tableFooter}>
                            <TableRow>
                                <TablePagination
                                    className={classes.pager}
                                    colSpan={headers.length}
                                    labelRowsPerPage={formatMessage(intl, "core", "rowsPerPage")}
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${formatMessage(intl, "core", "ofPages")} ${count}`}
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
                </Table>
            </Fragment>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(
    withStyles(styles)(SmallTable)
)));
