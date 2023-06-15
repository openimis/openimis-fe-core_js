import React, { useState, useEffect } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import { Tooltip, MenuItem } from "@material-ui/core";
import { formatMessage } from "../../helpers/i18n";
import { injectIntl } from "react-intl";

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
  const { intl, rights, selection, filters, exportFetch, exportFields, exportFieldsColumns, label=null } = props;
  const [exportStatus, setExport] = useState(0);
  const enabled = (selection) => {return exportStatus == 0};

  const exportData = () => {
    let prms = Object.keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"])
    
    prms.push(`fields: ${JSON.stringify(exportFields)}`)
    prms.push(`fieldsColumns: "${JSON.stringify(exportFieldsColumns).replace(/\"/g, '\\"')}"`)
    exportFetch(prms);
  };

  let entries = [{ 
    text: label || formatMessage(intl, "core", "exportSearchResult"), 
    action: exportData 
  }];

  entries = entries.map((i, idx) => (
      <Tooltip 
      title={formatMessage(intl, "core", "exportSearchResult.tooltip")}>
          <div><MenuItem 
          key={`selectionsMenu-export-${idx}`} 
          onClick={e => i.action()}
          disabled={!enabled(selection)}>
            {i.text}
          </MenuItem></div>
      </Tooltip>
))


  return (
      <div style={{ display: enabled(selection) ? "block" : "none" }}>
          {entries}
      </div>
  )
}

export default injectIntl(withStyles(styles)(SearcherExport));
