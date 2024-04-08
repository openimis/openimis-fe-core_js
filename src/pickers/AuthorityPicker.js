import React, { useState, useMemo } from "react";

import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import { MODULE_NAME } from "../constants";
import { formatRoleLabel } from "../helpers/role-label-formatter";

const WHITESPACE_REGEX = /\s/g;
const UNDERSCORE_REGEX = /_/g;

const AuthorityPicker = ({
  onChange,
  readOnly,
  required,
  withLabel = true,
  withPlaceholder,
  value,
  label,
  filterOptions,
  filterSelectedOptions,
  placeholder,
}) => {
  const modulesManager = useModulesManager();
  const [searchString, setSearchString] = useState("");
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query AuthorityPicker {
        modulesPermissions  {
            modulePermsList {
                moduleName
                permissions {
                    permsName
                    permsValue
                }
            }
        }
    }
    `,
  );

  const filteredPerms = useMemo(() => {
    if (!data) return [];

    const concatenatedSearchString = searchString.replace(WHITESPACE_REGEX, "").toLowerCase();

    return data.modulesPermissions.modulePermsList.flatMap((module) =>
      module.permissions
        .filter((perm) => {
          const concatenatedPermName = (module.moduleName + perm.permsName).replace(UNDERSCORE_REGEX, "").toLowerCase();
          return concatenatedPermName.includes(concatenatedSearchString);
        })
        .map((perm) => ({
          id: perm.permsValue,
          module: module.moduleName,
          ...perm,
        })),
    );
  }, [data, searchString]);

  const formatLabel = (perm) => formatRoleLabel(perm.module, perm.permsName);

  return (
    <Autocomplete
      options={filteredPerms}
      getOptionLabel={formatLabel}
      onChange={(option) => onChange(option)}
      required={required}
      placeholder={placeholder ?? formatMessage("core.AuthorityPicker.placeholder")}
      label={label ?? formatMessage("core.AuthorityPicker.label")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={isLoading}
      error={error}
      value={value}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      setCurrentString={setSearchString}
      onInputChange={() => {}}
    />
  );
};

export default AuthorityPicker;
