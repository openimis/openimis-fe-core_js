import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";

import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { useTranslations, useModulesManager } from "@openimis/fe-core";
import EconomicUnitPicker from "../../pickers/EconomicUnitPicker";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

const EconomicUnitDialog = ({
  classes,
  confirmationButton = "core.selectEconomicUnit.confirm",
  confirmMessage = "core.selectEconomicUnit.message",
  confirmState,
  confirmTitle = "core.selectEconomicUnit.title",
  onClose,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('core', modulesManager);
  const [value, setValue] = useState('');
  const [localStorageData, setLocalStorageData] = useState(localStorage.getItem('economicUnit'));

  const onChange = (option) => {
    setValue(option)
  }

  const onConfirm = () => {
    if (value) {
      localStorage.setItem("economicUnit", value);
    }
  }

  useEffect(() => {
    const handleLocalStorageChange = (e) => {
      console.log('LocalStorage change detected:', e);
      if (e.key === 'economicUnit') {
        setLocalStorageData(e.newValue);
      }
    };

    window.addEventListener('storage', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleLocalStorageChange);
    };
  }, []);

  console.log(localStorageData, 'aaaa')

  return (
    <Dialog open={confirmState && !localStorageData} onClose={onClose}>
      <DialogTitle>{formatMessage(confirmTitle)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{formatMessage(confirmMessage)}</DialogContentText>
        <EconomicUnitPicker
          readOnly={false}
          value={value}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} autoFocus className={classes.primaryButton}>
          {formatMessage(confirmationButton)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(withTheme(withStyles(styles)(EconomicUnitDialog)));
