import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Typography, Divider, Table, TableRow, TableHead, TableBody, TableCell } from "@material-ui/core";
import FormattedMessage from "./FormattedMessage";
<<<<<<< HEAD
import withModulesManager from "../helpers/modules";
=======
>>>>>>> 370f1fc00ae048222a28f1881cad609a5ae1e76a

const styles = theme => ({
    tableTitle: theme.table.title,
    tableHeader: theme.table.header,
    tableRow: theme.table.row,
});

class SmallTable extends Component {
    render() {
<<<<<<< HEAD
        const { modulesManager, classes, module, header, headers, items, itemFormatters } = this.props;
        var i = !!headers && headers.length
        while (!!headers && i--) {
            if (modulesManager.skipControl(module, headers[i])) {
                headers.splice(i, 1);
                itemFormatters.splice(i, 1);
            }
        }
=======
        const { classes, module, header, headers, items, itemFormatters } = this.props;
>>>>>>> 370f1fc00ae048222a28f1881cad609a5ae1e76a
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
                            <TableRow key={iidx}>
                                {itemFormatters && itemFormatters.map((f, fidx) => (
                                    <TableCell className={classes.tableRow} key={`v-${iidx}-${fidx}`}>
                                        {f(i)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Fragment>
        )
    }
<<<<<<< HEAD
}

export default withModulesManager(injectIntl(withTheme(
    withStyles(styles)(SmallTable)
)));
=======

}

export default injectIntl(withTheme(
    withStyles(styles)(SmallTable)
));
>>>>>>> 370f1fc00ae048222a28f1881cad609a5ae1e76a
