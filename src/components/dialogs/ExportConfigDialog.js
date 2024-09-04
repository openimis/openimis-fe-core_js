import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

import { useModulesManager, useTranslations } from "@openimis/fe-core";
import { isEmptyObject } from "../../helpers/utils";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const ExportConfigDialog = ({
  classes,
  module,
  confirmState,
  getFilteredFieldsAndColumn,
  chooseExportableColumns,
  onClose,
  onConfirm,
  columns,
  exportFileFormat,
  setExportFileFormat,
  exportFileFormats,
  chooseFileFormat,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(module, modulesManager);
  const [columnBoolValues, setColumnBoolValues] = useState({});

  useEffect(() => {
    if (Object.keys(columnBoolValues).length === 0) {
      const newColumnBoolValues = Object.fromEntries(Object.keys(columns).map((key) => [key, true]));
      setColumnBoolValues(newColumnBoolValues);
    }
  }, [columnBoolValues, columns]);

  const handleCheckboxChange = (key, checked) => {
    setColumnBoolValues({ ...columnBoolValues, [key]: checked });
  };

  const fillCheckboxesWithValue = (value) => {
    const newColumnBoolValues = Object.fromEntries(Object.keys(columnBoolValues).map((key) => [key, value]));
    setColumnBoolValues(newColumnBoolValues);
  };

  const getFilteredColumns = () => {
    return Object.fromEntries(
      Object.entries(columnBoolValues)
        .filter(([key, checked]) => checked)
        .map(([key]) => [key, columns[key]]),
    );
  };

  const handleConfirm = () => {
    const filteredColumns = getFilteredColumns();
    const filteredFields = Object.keys(filteredColumns);
    getFilteredFieldsAndColumn(filteredFields, filteredColumns);
    onConfirm();
    fillCheckboxesWithValue(true);
  };

  const handleCancel = () => {
    onClose();
    fillCheckboxesWithValue(true);
  };

  const showColumns = chooseExportableColumns && !isEmptyObject(columns);
  const showFileFormats = chooseFileFormat && !isEmptyObject(exportFileFormats);

  return (
    <Dialog open={confirmState} onClose={onClose}>
      <DialogTitle>{formatMessage("exportConfigDialog.title")}</DialogTitle>
      <Divider />
      <DialogContent>
        {showColumns && (
          <div>
            <Typography> {formatMessage("core.exportConfigDialog.selectColumns")} </Typography>
            {columns &&
              Object.entries(columns).map(([key, value], idx) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      color="primary"
                      checked={columnBoolValues[key]}
                      onChange={(event) => handleCheckboxChange(key, event.target.checked)}
                    />
                  }
                  label={value}
                />
              ))}
          </div>
        )}

        {showFileFormats && (
          <div>
            <Typography> {formatMessage("core.exportConfigDialog.selectFormat")} </Typography>
            {Object.entries(exportFileFormats).map(([key, value], idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<RadioButtonCheckedIcon />}
                    color="primary"
                    checked={exportFileFormat === key}
                    onChange={() => setExportFileFormat(key)}
                  />
                }
                label={value}
              />
            ))}
          </div>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        {showColumns && (
          <Button onClick={() => fillCheckboxesWithValue(false)} className={classes.secondaryButton}>
            {formatMessage("exportConfigDialog.clearAllColsButton")}
          </Button>
        )}
        <Button onClick={handleConfirm} autoFocus className={classes.primaryButton}>
          {formatMessage("exportConfigDialog.confirmButton")}
        </Button>
        <Button onClick={handleCancel} className={classes.secondaryButton}>
          {formatMessage("exportConfigDialog.cancelButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(withTheme(withStyles(styles)(ExportConfigDialog)));
