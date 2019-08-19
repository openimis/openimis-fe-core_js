import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import MaterialTable from "material-table";
import { formatMessage } from "../helpers/i18n";

const styles = theme => ({
    table: theme.formTable.table,
    actions: {
        color: theme.formTable.actions.color,
    },
});

class FormTable extends Component {
    render() {
        const { intl, theme, classes, module, title,
            actionsText = "row.actions", deleteText = "row.delete", noRecord = "noRecord",
            columns, data,
            onRowDelete,
        } = this.props;
        return (
            <MaterialTable
                className={classes.table}
                title={title}
                editable={{
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            onRowDelete(oldData, resolve);
                            resolve()
                        }),
                }}
                options={{
                    search: false,
                    paging: false,
                    sorting: false,
                    actionsCellStyle: theme.formTable.actions,
                    headerStyle: theme.formTable.header,
                }}
                localization={{
                    header: {
                        actions: formatMessage(intl, module, actionsText),
                    },
                    body: {
                        emptyDataSourceMessage: formatMessage(intl, module, noRecord),
                        addTooltip: null,
                        editTooltip: null,
                        deleteTooltip: null,
                        editRow: {
                            deleteText: formatMessage(intl, module, deleteText),
                            cancelTooltip: null,
                            saveTooltip: null,
                        },
                    },
                }}
                columns={columns}
                data={data}
            />
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(FormTable)));