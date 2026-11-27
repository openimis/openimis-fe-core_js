import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Checkbox, Chip, FormControlLabel, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchModulesPermissions } from "../actions";
import ProgressOrError from "./generics/ProgressOrError";
import { formatMessage } from "../helpers/i18n";
import { formatRoleLabel } from "../helpers/role-label-formatter";

const StyledPanel = styled("div")(({ theme }) => ({
  "& .paper": {
    ...theme.paper?.paper,
    backgroundColor: theme.palette.common.white,
  },
  "& .content": theme.paper?.item ?? { padding: theme.spacing(1.25) },
  "& .toolbar": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  "& .modulesGrid": {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: theme.spacing(2),
    alignItems: "stretch",
    [theme.breakpoints.down("md")]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    [theme.breakpoints.down("sm")]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
  "& .column": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.common.white,
  },
  "& .columnHeader": {
    padding: theme.spacing(1, 1.5),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(0.5),
    textAlign: "center",
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    "& .MuiChip-root": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.common.white,
    },
    "& .MuiCheckbox-root": {
      color: theme.palette.primary.contrastText,
      "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: theme.palette.primary.contrastText },
    },
  },
  "& .permissions": {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(1.5),
    overflow: "auto",
  },
  "& .permission": { margin: 0, width: "100%" },
}));

const formatModuleName = (moduleName) =>
  String(moduleName || "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const permissionLabel = (intl, moduleName, permsName) => {
  const translationId = `${moduleName}.${permsName}`;
  const translated = formatMessage(intl, null, translationId);
  if (translated !== translationId) return translated;

  const fallback = formatRoleLabel(moduleName, permsName, true);
  return fallback.includes(" | ") ? fallback.split(" | ").slice(1).join(" | ") : fallback;
};

const LegacyRoleRightsPanel = ({ edited, onEditedChanged, isReadOnly, intl }) => {
  const dispatch = useDispatch();
  const fetchingModulePermissions = useSelector((state) => state.core?.fetchingModulePermissions);
  const fetchedModulePermissions = useSelector((state) => state.core?.fetchedModulePermissions);
  const modulePermissions = useSelector((state) => state.core?.modulePermissions || []);
  const errorModulePermissions = useSelector((state) => state.core?.errorModulePermissions);
  const selected = useMemo(() => new Set((edited?.roleRights || []).map(Number)), [edited?.roleRights]);

  useEffect(() => {
    if (!fetchedModulePermissions) dispatch(fetchModulesPermissions());
  }, [dispatch, fetchedModulePermissions]);

  const modules = useMemo(
    () =>
      [...modulePermissions]
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
        .map((module) => ({
          name: module.moduleName,
          label: formatModuleName(module.moduleName),
          permissions: (module.permissions || []).map((permission, index) => ({
            key: `${module.moduleName}-${permission.permsValue}-${index}`,
            id: Number(permission.permsValue),
            label: permissionLabel(intl, module.moduleName, permission.permsName),
          })),
        }))
        .filter((module) => module.permissions.length),
    [intl, modulePermissions],
  );
  const allRights = useMemo(
    () => [...new Set(modules.flatMap((module) => module.permissions.map((permission) => permission.id)))],
    [modules],
  );
  const updateRights = (rightIds) => {
    const allSelected = rightIds.every((id) => selected.has(id));
    const next = new Set(selected);
    rightIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
    onEditedChanged({ ...edited, roleRights: [...next] });
  };

  return (
    <StyledPanel>
      <Paper className="paper">
        <div className="content">
          <div className="toolbar">
            <Chip size="small" label={`${selected.size} / ${allRights.length} rights selected`} />
            <Button
              size="small"
              onClick={() => onEditedChanged({ ...edited, roleRights: allRights })}
              disabled={isReadOnly}
            >
              All
            </Button>
            <Button size="small" onClick={() => onEditedChanged({ ...edited, roleRights: [] })} disabled={isReadOnly}>
              Clear
            </Button>
          </div>
          <ProgressOrError progress={fetchingModulePermissions} error={errorModulePermissions} />
          <div className="modulesGrid">
            {modules.map((module) => {
              const ids = [...new Set(module.permissions.map((permission) => permission.id))];
              const count = ids.filter((id) => selected.has(id)).length;
              return (
                <Card className="column" variant="outlined" key={module.name}>
                  <div className="columnHeader">
                    <Typography fontWeight={600}>{module.label}</Typography>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Chip size="small" label={`${count}/${ids.length}`} />
                      <Checkbox
                        size="small"
                        checked={!!ids.length && count === ids.length}
                        indeterminate={count > 0 && count < ids.length}
                        disabled={isReadOnly}
                        onChange={() => updateRights(ids)}
                      />
                    </Box>
                  </div>
                  <div className="permissions">
                    {module.permissions.map((permission) => (
                      <FormControlLabel
                        className="permission"
                        key={permission.key}
                        label={
                          <Typography
                            variant="body2"
                            color={selected.has(permission.id) ? "primary" : "text.secondary"}
                          >
                            {permission.label}
                          </Typography>
                        }
                        control={
                          <Checkbox
                            size="small"
                            checked={selected.has(permission.id)}
                            disabled={isReadOnly}
                            onChange={() => updateRights([permission.id])}
                          />
                        }
                      />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Paper>
    </StyledPanel>
  );
};

export default LegacyRoleRightsPanel;
