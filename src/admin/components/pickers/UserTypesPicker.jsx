import React from "react";
import { useSelector } from "react-redux";
import { useIntl } from "react-intl";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { formatMessage } from "@openimis/fe-core";

import { USER_TYPES } from "../../constants";

const UserTypesPicker = (props) => {
  const intl = useIntl();
  const rights = useSelector((state) =>
    !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  );
  const options = USER_TYPES(rights).map((ut) => ({
    id: ut,
    label: formatMessage(intl, "admin.user", `userTypes.${ut}`),
  }));
  const value = [];
  if (props.value) {
    props.value.forEach((v) => {
      const fullValue = options.find((o) => o.id === v);
      if (fullValue) {
        value.push(fullValue);
      }
    });
  }
  return (
    <Autocomplete
      multiple
      noOptionsText={formatMessage(intl, "admin.user", "userTypes.noOptions")}
      disabled={props.readOnly}
      id="user-types-select"
      options={options}
      getOptionLabel={(option) => option.label}
      onChange={(e, userTypes) => props.onChange(userTypes.map((ut) => ut.id))}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label={formatMessage(intl, "admin.user", "userTypes")}
          placeholder=""
        />
      )}
      value={value}
    />
  );
};

export default UserTypesPicker;
