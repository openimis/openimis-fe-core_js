import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import { Tooltip, MenuItem } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";
import { injectIntl } from "react-intl";
import {closeExportColumnsDialog, openExportColumnsDialog} from "../../actions";
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
  const { intl, rights, selection, filters, exportFetch, exportFields, exportFieldsColumns, chooseExportableColumns, label=null } = props;
  const [exportStatus, setExport] = useState(0);
  const [filteredExportFields, setFilteredExportFields] = useState(exportFields);
  const [filteredExportFieldColumns, setFilteredExportFieldColumns] = useState(exportFieldsColumns);
  const dispatch = useDispatch();
  const isExportColumnsDialogOpen = useSelector((state) => state.core?.isExportColumnsDialogOpen);
  const enabled = (selection) => {return exportStatus == 0};

  const exportData = (fields=exportFields, columns=exportFieldsColumns) => {
    let prms = Object.keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"])

    prms.push(`fields: ${JSON.stringify(fields)}`)
    prms.push(`fieldsColumns: "${JSON.stringify(columns).replace(/\"/g, '\\"')}"`)
    exportFetch(prms);
  };

  const handleExportData = () => {
    if (chooseExportableColumns) {
      dispatch(openExportColumnsDialog())
    } else {
      exportData()
    }
  }

  const handleColumnFiltering = (fields, columns) => {
    exportData(fields, columns)
  }


  let entries = [{
    text: label || formatMessage(intl, "core", "exportSearchResult"),
    action: handleExportData
  }];

  entries = entries.map((i, idx) => (
      <Tooltip
      title={formatMessage(intl, "core", "exportSearchResult.tooltip")}>
          <div>
            <MenuItem
              key={`selectionsMenu-export-${idx}`}
              onClick={e => i.action()}
              disabled={!enabled(selection)}
            >
              {i.text}
            </MenuItem>
          </div>
      </Tooltip>
  ))


  return (
    <>
      <ExportColumnsDialog
        confirmState={isExportColumnsDialogOpen}
        onConfirm={() => dispatch(closeExportColumnsDialog())}
        onClose={() => dispatch(closeExportColumnsDialog())}
        module="core"
        getFilteredFieldsAndColumn={handleColumnFiltering}
        columns={exportFieldsColumns}
      />
      <div style={{ display: enabled(selection) ? "block" : "none" }}>
        {entries}
      </div>
  </>
  )

}

export default injectIntl(withStyles(styles)(SearcherExport));
