import React from "react";
import { FormControlLabel, Checkbox, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatMessage } from "../../helpers/i18n";
import TextInput from "../inputs/TextInput";
import PublishedComponent from "./PublishedComponent";
import _debounce from "lodash/debounce";
import { injectIntl } from "react-intl";
import { GRID_RESPONSIVE_STANDARD, GRID_RESPONSIVE_SMALL, GRID_RESPONSIVE_FULL } from "../../constants/responsiveGrid";

const useFilterChangeHandler = (onChangeFilters) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, 300);

  const onChangeStringFilter =
    (filterName, lookup = null) =>
    (value) => {
      const filterValue = lookup ? `${filterName}_${lookup}: "${value}"` : `${filterName}: "${value}"`;
      debouncedOnChangeFilters([{ id: filterName, value, filter: filterValue }]);
    };

  const onChangeFilter = (k, v) => {
    let gqlQuery = `${k}: ${v}`;
    if (v && typeof v === "object" && "id" in v) {
      gqlQuery = v.id ? `${k}_Id: "${v.id}"` : "";
    }
    onChangeFilters([{ id: k, value: v, filter: gqlQuery }]);
  };

  return { onChangeStringFilter, onChangeFilter };
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  "&.form": {
    padding: 0,
  },
  "& .item": {
    padding: theme.spacing(1),
  },
}));

function FilterTextInput({ module, label, value, onChange }) {
  return (
    <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
      <TextInput module={module} label={label} value={value} onChange={onChange} />
    </Grid>
  );
}

function FilterCheckbox({ module, checked, onChange, label, intl, filterName }) {
  return (
    <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onChange} name={filterName} />}
        label={formatMessage(intl, module, label)}
      />
    </Grid>
  );
}

function Filter({
  moduleName,
  intl,
  filters,
  onChangeFilters,
  filterFields,
  pickerFields,
  checkboxFields,
  withLocationFilter,
}) {
  const { onChangeStringFilter, onChangeFilter } = useFilterChangeHandler(onChangeFilters);

  return (
    <StyledGrid container className="form">
      {filterFields.map((field) => (
        <FilterTextInput
          key={field.name}
          module={moduleName}
          label={field.label}
          value={filters?.[field.name]?.value ?? ""}
          onChange={onChangeStringFilter(field.name, field.lookup)}
        />
      ))}

      {pickerFields?.map((field) => (
        <Grid size={GRID_RESPONSIVE_STANDARD} key={field.name} className="item">
          <field.component
            withLabel
            value={filters?.[field.name]?.value ?? null}
            onChange={(v) => onChangeFilter(field.name, v)}
            readOnly={false}
            {...field.props}
          />
        </Grid>
      ))}

      {checkboxFields.map((field) => (
        <FilterCheckbox
          key={field.name}
          checked={filters?.[field.name]?.value ?? false}
          onChange={(event) => onChangeFilter(field.name, event.target.checked)}
          label={field.label}
          intl={intl}
          module={moduleName}
          filterName={field.name}
        />
      ))}

      {withLocationFilter && (
        <Grid size={GRID_RESPONSIVE_FULL}>
          <PublishedComponent
            pubRef="location.DetailedLocationFilter"
            withNull
            filters={filters}
            onChangeFilters={onChangeFilters}
            anchor="parentLocation"
          />
        </Grid>
      )}
    </StyledGrid>
  );
}

export { useFilterChangeHandler };
export default injectIntl(Filter);
