import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";

import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, Checkbox, DialogTitle, FormControlLabel } from "@material-ui/core";
import { useTranslations, useModulesManager } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const ExportColumnsDialog = ({
  classes,
  module,
  confirmState,
  getFilteredFieldsAndColumn,
  onClose,
  onConfirm,
  columns
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(module, modulesManager);
  const [columnBoolValues, setColumnBoolValues] = useState({});

  const isObjectEmpty = (object) => {
    return Object.keys(columnBoolValues).length === 0
  }

  useEffect(() => {
    if (isObjectEmpty(columnBoolValues)) {
      const newColumnBoolValues = {};
      for (const key of Object.keys(columns)) {
        newColumnBoolValues[key] = true;
      }
      setColumnBoolValues(newColumnBoolValues);
    }
  }, [])

  const fillCheckboxesWithValue = (value) => {
    const newColumnBoolValues = Object.fromEntries(
      Object.keys(columnBoolValues).map(key => [key, value])
    );
    setColumnBoolValues(newColumnBoolValues);
  }

  const getFilteredColumns = () => {
    const result = {};

    Object.keys(columnBoolValues).forEach(key => {
      if (columnBoolValues[key] === true) {
        result[key] = columns[key];
      }
    });

    return result;
  };

  const handleConfirm = () => {
    const filteredColumns = getFilteredColumns();
    const filteredFields = [...Object.keys(filteredColumns), "json_ext"];
    getFilteredFieldsAndColumn(filteredFields, filteredColumns);
    onConfirm();
    fillCheckboxesWithValue(true);
  }

  const handleCancel = () => {
    onClose();
    fillCheckboxesWithValue(true);
  }

  return (
    <Dialog open={confirmState} onClose={onClose}>
      <DialogTitle>{formatMessage('exportColumnsDialog.title')}</DialogTitle>
      <DialogContent>
        {columns && Object.entries(columns).map(([key, value], idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                color="primary"
                checked={columnBoolValues[key]}
                onChange={(event) => setColumnBoolValues({...columnBoolValues, [key]: event.target.checked})}
              />
            }
            label={value}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => fillCheckboxesWithValue(false)} className={classes.secondaryButton}>
          {formatMessage('exportColumnsDialog.clearAllButton')}
        </Button>
        <Button onClick={handleConfirm} autoFocus className={classes.primaryButton}>
          {formatMessage("exportColumnsDialog.confirmButton")}
        </Button>
        <Button onClick={handleCancel} className={classes.secondaryButton}>
          {formatMessage('exportColumnsDialog.cancelButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(withTheme(withStyles(styles)(ExportColumnsDialog)));
