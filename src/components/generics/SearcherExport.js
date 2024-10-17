import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { MenuItem, Tooltip, Button, Typography } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import GetAppIcon from "@material-ui/icons/GetApp";

import { closeExportConfigDialog, openExportConfigDialog } from "../../actions";
import { EXPORT_FILE_FORMATS } from "../../constants";
import { formatMessage } from "../../helpers/i18n";
import ExportConfigDialog from "../dialogs/ExportConfigDialog";

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
    selection,
    filters,
    exportFetch,
    exportFields,
    exportFieldsColumns,
    chooseExportableColumns,
    additionalExportFields,
    chooseFileFormat,
    exportFileFormats,
    exportFileFormat = EXPORT_FILE_FORMATS.csv,
    setExportFileFormat,
    label = null,
    selectWithCheckbox,
    downloadWithIconButton,
    classes,
  } = props;

  const [exportStatus, setExport] = useState(0);
  const dispatch = useDispatch();
  const isExportConfigDialogOpen = useSelector((state) => state.core?.isExportConfigDialogOpen);

  const enabled = (selection) => (selectWithCheckbox ? !selection?.length && exportStatus === 0 : exportStatus === 0);

  const exportData = (
    fields = exportFields,
    columns = exportFieldsColumns,
    additionalFields = additionalExportFields,
  ) => {
    const defaultFilters = Object.keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"]);

    const additionalFilters = Object.entries(additionalFields || {}).map(([key, value]) => `${key}: "${value}"`);

    const parameters = [...defaultFilters, ...additionalFilters];

    parameters.push(`fileFormat: "${exportFileFormat}"`);
    parameters.push(`fields: ${JSON.stringify(fields)}`);
    parameters.push(`fieldsColumns: "${JSON.stringify(columns).replace(/\"/g, '\\"')}"`);
    exportFetch(parameters);
  };

  const handleExportData = () => {
    if (chooseExportableColumns || chooseFileFormat) {
      dispatch(openExportConfigDialog());
    } else {
      exportData();
    }
  };

  const handleColumnFiltering = (fields, columns) => {
    exportData(fields, columns);
  };

  const parseToDialogColumns = (columns, fields) => {
    return fields.reduce(
      (dialogColumns, field) => {
        if (!(field in dialogColumns)) {
          dialogColumns[field] = field.startsWith("json_ext__") ? field.replace(/^json_ext__/, "") : field;
        }
        return dialogColumns;
      },
      { ...columns },
    );
  };

  const entries = [
    {
      text: label || formatMessage(intl, "core", "exportSearchResult"),
      icon: <GetAppIcon />,
      action: handleExportData,
    },
  ];

  return (
    <>
      {(chooseExportableColumns || chooseFileFormat) && (
        <ExportConfigDialog
          confirmState={isExportConfigDialogOpen}
          onConfirm={() => dispatch(closeExportConfigDialog())}
          onClose={() => dispatch(closeExportConfigDialog())}
          module="core"
          getFilteredFieldsAndColumn={handleColumnFiltering}
          columns={parseToDialogColumns(exportFieldsColumns, exportFields)}
          exportFileFormat={exportFileFormat}
          setExportFileFormat={setExportFileFormat}
          exportFileFormats={exportFileFormats}
          chooseFileFormat={chooseFileFormat}
          chooseExportableColumns={chooseExportableColumns}
        />
      )}

      <div>
        {entries.map((item, idx) => (
          <Tooltip title={formatMessage(intl, "core", "exportSearchResult.tooltip")}>
            <div key={`selectionsMenu-export-${idx}`}>
              {downloadWithIconButton ? (
                <Button
                  onClick={(e) => item.action()}
                  disabled={!enabled(selection)}
                  variant="contained"
                  color="primary"
                  startIcon={item.icon}
                >
                  <Typography variant="body2"> {item.text} </Typography>
                </Button>
              ) : (
                <MenuItem onClick={(e) => item.action()} disabled={!enabled(selection)}>
                  {item.text}
                </MenuItem>
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </>
  );
}

export default injectIntl(withStyles(styles)(SearcherExport));
