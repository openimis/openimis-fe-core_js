import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { withModulesManager, useDebounceCb, useTranslations } from "@openimis/fe-core";
import { fetchUsers } from "../../actions";
import { DEFAULT } from "../../constants";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

const UserPicker = (props) => {
  const {
    onChange,
    modulesManager,
    readOnly = false,
    required = false,
    withLabel = true,
    healthFacility,
    filters: filtersProp,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple = false,
    searchOnInput = true,
  } = props;
  const filters = useMemo(() => filtersProp ?? [], [JSON.stringify(filtersProp)]);
  const minCharLookup = modulesManager.getConf("fe-admin", "usersMinCharLookup", 2);
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("admin.UserPicker", modulesManager);
  const [open, setOpen] = useState(false);
  const users = useSelector((state) => state.admin.users.items);
  const isLoading = useSelector((state) => state.admin.users.isLoading);

  const debouncedSetSearchString = useDebounceCb(
    setSearchString,
    modulesManager.getConf("fe-admin", "debounceTime", 400),
  );

  const formatSuggestion = (p) => {
    const renderLastNameFirst = modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );

    if (!p || typeof p !== "object") {
      return "";
    }
    return [
      p.username,
      renderLastNameFirst ? p.iUser?.lastName : p.iUser?.otherNames,
      !renderLastNameFirst ? p.iUser?.lastName : p.iUser?.otherNames,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const [inputValue, setInputValue] = useState(() => formatSuggestion(value));

  useEffect(() => {
    if (!searchOnInput) {
      setInputValue(formatSuggestion(value));
    }
  }, [value, searchOnInput]);

  const handleChange = (event, selected) => {
    setSearchString(null);
    if (!searchOnInput) {
      setInputValue(formatSuggestion(selected));
    }
    onChange?.(selected);
    if (!multiple) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (readOnly) return;
    if (!searchOnInput || !searchString || searchString.length <= minCharLookup) {
      return;
    }
    dispatch(fetchUsers(modulesManager, [`str: "${searchString}"`, ...filters].filter(Boolean), !healthFacility));
  }, [searchString, searchOnInput, minCharLookup, dispatch, modulesManager, filters, healthFacility, readOnly]);

  const handleOpen = () => {
    if (readOnly) return;
    setOpen(true);
    dispatch(fetchUsers(modulesManager, [`first: 10`, ...filters], !healthFacility));
  };

  return (
    <Autocomplete
      loadingText={formatMessage("loadingText")}
      openText={formatMessage("openText")}
      closeText={formatMessage("closeText")}
      clearText={formatMessage("clearText")}
      openOnFocus
      multiple={multiple}
      options={users}
      loading={isLoading}
      open={readOnly ? false : open}
      onOpen={readOnly ? undefined : handleOpen}
      onClose={() => setOpen(false)}
      value={value}
      getOptionLabel={(option) => formatSuggestion(option)}
      isOptionEqualToValue={(option, v) => option?.id === v?.id}
      onChange={handleChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      {...(!searchOnInput && {
        inputValue,
        onInputChange: (event, newInputValue, reason) => {
          if (reason === "clear") {
            setInputValue("");
          }
        },
      })}
      {...(searchOnInput && {
        onInputChange: (event, query, reason) => {
          if (reason !== "input") {
            return;
          }
          if (!readOnly) {
            debouncedSetSearchString(query);
          }
        },
      })}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          required={required}
          label={withLabel && (label || formatMessage("label"))}
          placeholder={placeholder}
          inputProps={{
            ...inputProps.inputProps,
            readOnly: readOnly,
          }}
        />
      )}
    />
  );
};

export { styles };
export default withModulesManager(UserPicker);
