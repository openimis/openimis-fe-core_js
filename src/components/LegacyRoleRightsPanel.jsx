import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Checkbox, Chip, FormControlLabel, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchModulesPermissions } from "../actions";

const StyledPanel = styled("div")(({ theme }) => ({
  "& .paper": {
    ...(theme.paper?.paper ?? {}),
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
  "& .scroll": { padding: theme.spacing(1.5), maxHeight: "68vh", overflow: "auto" },
  "& .group": {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 6,
    textAlign: "center",
    backgroundColor: theme.palette.common.white,
  },
  "& .groupHeader": { margin: 0, justifyContent: "center", width: "100%" },
  "& .actions": {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "fit-content",
    margin: "0 auto",
  },
}));

const SECTION_ORDER = ["Insurees and Policies", "Claims", "Administration", "Tools & Reports"];
const sectionFor = (moduleName) => {
  const value = String(moduleName || "").toLowerCase();
  if (/claim/.test(value)) return "Claims";
  if (/report|register|extract|utility|fund|tool/.test(value)) return "Tools & Reports";
  if (/admin|product|facility|user|payer|location|enrol|medical|diagnos|hospital/.test(value)) return "Administration";
  return "Insurees and Policies";
};

const LegacyRoleRightsPanel = ({ edited, onEditedChanged, isReadOnly }) => {
  const dispatch = useDispatch();
  const fetchedModulePermissions = useSelector((state) => state.core?.fetchedModulePermissions);
  const modulePermissions = useSelector((state) => state.core?.modulePermissions || []);
  const selected = useMemo(() => new Set((edited?.roleRights || []).map(Number)), [edited?.roleRights]);

  useEffect(() => {
    if (!fetchedModulePermissions) dispatch(fetchModulesPermissions());
  }, [dispatch, fetchedModulePermissions]);

  const sections = useMemo(() => {
    const result = Object.fromEntries(SECTION_ORDER.map((section) => [section, []]));
    [...modulePermissions]
      .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
      .forEach((module) => {
        const actions = (module.permissions || []).map((permission) => ({
          id: Number(permission.permsValue),
          label: String(permission.permsName || "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        }));
        if (actions.length) result[sectionFor(module.moduleName)].push({ name: module.moduleName, actions });
      });
    return result;
  }, [modulePermissions]);
  const allRights = useMemo(
    () =>
      Object.values(sections).flatMap((groups) => groups.flatMap((group) => group.actions.map((action) => action.id))),
    [sections],
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
          <div className="modulesGrid">
            {SECTION_ORDER.map((section) => {
              const groups = sections[section];
              const ids = groups.flatMap((group) => group.actions.map((action) => action.id));
              const count = ids.filter((id) => selected.has(id)).length;
              return (
                <Card className="column" variant="outlined" key={section}>
                  <div className="columnHeader">
                    <Typography fontWeight={600}>{section}</Typography>
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
                  <div className="scroll">
                    {groups.map((group) => {
                      const groupIds = group.actions.map((action) => action.id);
                      const groupCount = groupIds.filter((id) => selected.has(id)).length;
                      return (
                        <div className="group" key={group.name}>
                          <FormControlLabel
                            className="groupHeader"
                            label={<Typography fontWeight={600}>{group.name}</Typography>}
                            control={
                              <Checkbox
                                size="small"
                                checked={!!groupIds.length && groupCount === groupIds.length}
                                indeterminate={groupCount > 0 && groupCount < groupIds.length}
                                disabled={isReadOnly}
                                onChange={() => updateRights(groupIds)}
                              />
                            }
                          />
                          <div className="actions">
                            {group.actions.map((action) => (
                              <FormControlLabel
                                key={action.id}
                                label={
                                  <Typography
                                    variant="body2"
                                    color={selected.has(action.id) ? "primary" : "text.secondary"}
                                  >
                                    {action.label}
                                  </Typography>
                                }
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={selected.has(action.id)}
                                    disabled={isReadOnly}
                                    onChange={() => updateRights([action.id])}
                                  />
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
