import React, { useEffect, useState } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Autocomplete as MuiAutocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { useDebounceCb } from "../../helpers/hooks";
import { useTranslations } from "../../helpers/i18n";
import { useModulesManager } from "../../helpers/modules";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

const defaultGetOptionSelected = (option, v) => option.id === v.id;

const Autocomplete = (props) => {
  const {
    onChange,
    readOnly = false,
    required = false,
    withLabel = true,
    withPlaceholder = true,
    autoHighlight = true,
    value,
    className,
    fullWidth = true,
    options,
    isLoading,
    label,
    filterOptions,
    getOptionLabel,
    getOptionSelected = defaultGetOptionSelected,
    filterSelectedOptions,
    placeholder,
    onInputChange,
    multiple = false,
  } = props;
  const modulesManager = useModulesManager();
  const minCharLookup = modulesManager.getConf("fe-admin", "usersMinCharLookup", 2);
  const { formatMessage } = useTranslations("core.Autocomplete", modulesManager);
  const [open, setOpen] = useState(false);

  const handleInputChange = useDebounceCb((searchString) => {
    if (open && (!searchString || searchString.length > minCharLookup)) {
      onInputChange(searchString);
    }
  }, modulesManager.getConf("fe-admin", "debounceTime", 400));

  // eslint-disable-next-line no-shadow
  const handleChange = (__, value) => {
    onChange(value);
  };

  useEffect(() => {
    if (open) {
      onInputChange();
    }
  }, [open]);

  return (
    <MuiAutocomplete
      fullWidth={fullWidth}
      className={className}
      loadingText={formatMessage("loadingText")}
      openText={formatMessage("openText")}
      closeText={formatMessage("closeText")}
      clearText={formatMessage("clearText")}
      openOnFocus
      blurOnSelect={!multiple}
      multiple={multiple}
      disabled={readOnly}
      options={options}
      loading={isLoading}
      autoHighlight={autoHighlight}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      autoComplete
      value={value}
      getOptionLabel={getOptionLabel ?? ((option) => option.label)}
      getOptionSelected={getOptionSelected}
      onChange={handleChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(__, query) => handleInputChange(query)}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          variant="standard"
          cd
          required={required}
          label={withLabel && (label || formatMessage("label"))}
          placeholder={!readOnly && withPlaceholder && (placeholder || formatMessage("placeholder"))}
        />
      )}
    />
  );
};

export default withTheme(withStyles(styles)(Autocomplete));
