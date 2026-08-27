import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAutocomplete from "@mui/material/Autocomplete";
import { TextField, Paper, Button } from "@mui/material";
import { useDebounceCb } from "../../helpers/hooks";
import { useTranslations } from "../../helpers/i18n";
import { useModulesManager } from "../../helpers/modules";

const StyledAutocomplete = styled("div")(({ theme }) => ({
  "& .label": {
    color: theme.palette.primary.main,
  },
  "& .MuiAutocomplete-root": {
    minWidth: "150px",
    width: "100%",
  },
  "& .MuiTextField-root": {
    minWidth: "150px",
    width: "100%",
  },
  "& .MuiChip-deleteIcon": {
    fontSize: "16px",
  },
}));

const defaultGetOptionSelected = (option, v) => option.id === v?.id;

const PaperWithConfirm = ({ multiple, onConfirm, confirmLabel, ...paperProps }) => (
  <Paper {...paperProps}>
    {paperProps.children}
    {multiple && (
      <Button
        fullWidth
        size="small"
        variant="text"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onConfirm}
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
      >
        {confirmLabel}
      </Button>
    )}
  </Paper>
);

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
    minWidth,
    fullWidth = true,
    options,
    isLoading,
    label,
    filterOptions,
    getOptionLabel,
    isOptionEqualToValue = defaultGetOptionSelected,
    filterSelectedOptions,
    placeholder,
    onInputChange,
    setCurrentString,
    multiple = false,
    renderInput,
    noOptionsText,
    limitTags,
  } = props;
  const modulesManager = useModulesManager();
  const minCharLookup = modulesManager.getConf("fe-admin", "usersMinCharLookup", 2);
  const { formatMessage } = useTranslations("core.Autocomplete", modulesManager);
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(Date.now());

  const handleInputChange = useDebounceCb((searchString) => {
    setCurrentString && setCurrentString(searchString);

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

  useEffect(() => {
    setResetKey(Date.now());
  }, [value]);

  const hasValue = multiple ? value?.length > 0 : !!value;

  return (
    <StyledAutocomplete>
      <MuiAutocomplete
        key={resetKey}
        fullWidth={fullWidth}
        noOptionsText={noOptionsText}
        className={className}
        style={{ minWidth }}
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
        onClose={() => !multiple && setOpen(false)}
        limitTags={limitTags ?? -1}
        autoComplete
        value={value}
        getOptionLabel={getOptionLabel ?? ((option) => option.label)}
        isOptionEqualToValue={isOptionEqualToValue}
        onChange={handleChange}
        filterOptions={filterOptions}
        filterSelectedOptions={filterSelectedOptions}
        onInputChange={(__, query) => handleInputChange(query)}
        PaperComponent={(paperProps) => (
          <PaperWithConfirm
            {...paperProps}
            multiple={multiple}
            onConfirm={() => setOpen(false)}
            confirmLabel={formatMessage("core.confirmSelect")}
          />
        )}
        renderInput={
          !!renderInput
            ? renderInput
            : (inputProps) => (
              <TextField
                {...inputProps}
                required={required}
                InputLabelProps={{ shrink: value !== undefined, className: "label" }}
                label={withLabel && (label || formatMessage("label"))}
                placeholder={!readOnly && !hasValue && withPlaceholder ? placeholder || formatMessage("placeholder") : undefined
                }
              />
            )
        }
      />
    </StyledAutocomplete>
  );
};

export default Autocomplete;
