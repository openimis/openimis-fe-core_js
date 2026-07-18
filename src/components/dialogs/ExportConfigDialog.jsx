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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GetIconComponent from "../../helpers/icons";
const RadioButtonCheckedIcon = GetIconComponent("RadioButtonChecked");
const RadioButtonUncheckedIcon = GetIconComponent("RadioButtonUnchecked");

import { useModulesManager } from "../../helpers/modules";
import { useTranslations } from "../../helpers/i18n";
import { isEmptyObject } from "../../helpers/utils";

const StyledDialog = styled("div")(({ theme }) => ({
  "& .primaryButton": theme?.dialog?.primaryButton ?? {},
  "& .secondaryButton": theme?.dialog?.secondaryButton ?? {},
}));

const ExportConfigDialog = ({
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
  displayClearAllColsButton = true,
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
    <StyledDialog>
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
          {displayClearAllColsButton && showColumns && (
            <Button onClick={() => fillCheckboxesWithValue(false)} className="secondaryButton">
              {formatMessage("exportConfigDialog.clearAllColsButton")}
            </Button>
          )}
          <Button onClick={handleConfirm} autoFocus className="primaryButton">
            {formatMessage("exportConfigDialog.confirmButton")}
          </Button>
          <Button onClick={handleCancel} className="secondaryButton">
            {formatMessage("exportConfigDialog.cancelButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
};

export { StyledDialog };
export default injectIntl(ExportConfigDialog);
