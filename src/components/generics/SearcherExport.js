import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import { MenuItem, Tooltip } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";
import { injectIntl } from "react-intl";
import {
  closeExportColumnsDialog,
  openExportColumnsDialog,
} from "../../actions";
import ExportColumnsDialog from "../dialogs/ExportColumnsDialog";

const styles = (theme) => ({
  error: {
    padding: theme.spacing(2),
  },
  errorHeader: {
    color: theme.palette.error.main,
  },
  errorDetail: {
    color: theme.palette.error.main,
  },
});

function SearcherExport(props) {
  const {
    intl,
    rights,
    selection,
    filters,
    exportFetch,
    exportFields,
    exportFieldsColumns,
    chooseExportableColumns,
    additionalExportFields,
    label = null,
  } = props;

  const [exportStatus, setExport] = useState(0);
  const dispatch = useDispatch();
  const isExportColumnsDialogOpen = useSelector(
    (state) => state.core?.isExportColumnsDialogOpen
  );

  const enabled = selection => exportStatus === 0;

  const exportData = (
    fields = exportFields,
    columns = exportFieldsColumns,
    additionalFields = additionalExportFields,
  ) => {
    const defaultFilters = Object
      .keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"]);

    const additionalFilters = Object.entries(additionalFields || {}).map(([key, value]) => `${key}: "${value}"`);

    const parameters = [...defaultFilters, ...additionalFilters];

    parameters.push(`fields: ${JSON.stringify(fields)}`);
    parameters.push(`fieldsColumns: "${JSON.stringify(columns).replace(/\"/g, '\\"')}"`);
    exportFetch(parameters);
  };

  const handleExportData = () => {
    if (chooseExportableColumns) {
      dispatch(openExportColumnsDialog());
    } else {
      exportData();
    }
  };

  const handleColumnFiltering = (fields, columns) => {
    exportData(fields, columns);
  };

  const parseToDialogColumns = (columns, fields) => {
    return fields.reduce((dialogColumns, field) => {
      if (!(field in dialogColumns)) {
        dialogColumns[field] = field.startsWith("json_ext__")
          ? field.replace(/^json_ext__/, "")
          : field;
      }
      return dialogColumns;
    }, { ...columns });
  };

  const entries = [
    {
      text: label || formatMessage(intl, "core", "exportSearchResult"),
      action: handleExportData,
    },
  ];

  return (
    <>
      {chooseExportableColumns && (
        <ExportColumnsDialog
          confirmState={isExportColumnsDialogOpen}
          onConfirm={() => dispatch(closeExportColumnsDialog())}
          onClose={() => dispatch(closeExportColumnsDialog())}
          module="core"
          getFilteredFieldsAndColumn={handleColumnFiltering}
          columns={parseToDialogColumns(exportFieldsColumns, exportFields)}
        />
      )}

      <div style={{ display: enabled(selection) ? "block" : "none" }}>
        {entries.map((item, idx) => (
          <Tooltip title={formatMessage(intl, "core", "exportSearchResult.tooltip")}>
            <div key={`selectionsMenu-export-${idx}`}>
              <MenuItem
                onClick={(e) => item.action()}
                disabled={!enabled(selection)}
              >
                {item.text}
              </MenuItem>
            </div>
          </Tooltip>
        ))}
      </div>
    </>
  );
}

export default injectIntl(withStyles(styles)(SearcherExport));
