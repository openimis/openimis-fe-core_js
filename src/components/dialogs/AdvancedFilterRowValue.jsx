import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import PublishedComponent from "../generics/PublishedComponent";
import TextInput from "../inputs/TextInput";
import NumberInput from "../inputs/NumberInput";
import SelectInput from "../inputs/SelectInput";
import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { connect } from "react-redux";
import CustomFilterFieldStatusPicker from "../../pickers/CustomFilterFieldStatusPicker";
import CustomFilterTypeStatusPicker from "../../pickers/CustomFilterTypeStatusPicker";
import { BOOL_OPTIONS, CLEARED_STATE_FILTER, INTEGER, DATE, STRING, BOOLEAN } from "../../constants";

const StyledGrid = styled(Grid)(({ theme }) => ({
  "& .item": theme.paper?.item ?? {},
  backgroundColor: theme.paper?.paper?.backgroundColor ?? "#dbeef0",
  "& .removeIcon": {
    transform: "translate(-50%, -50%)",
    fontSize: "16px",
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
  "& .removeIconContainer": {
    backgroundColor: theme.paper?.paper?.backgroundColor ?? "#dbeef0",
    width: "25px",
    height: "25px",
    marginTop: "25px",
  },
}));

const AdvancedFilterRowValue = ({
  intl,
  customFilters,
  currentFilter,
  setCurrentFilter,
  index,
  filters,
  setFilters,
}) => {
  const onAttributeChange = (attribute) => (value) => {
    let updatedFilter = { ...currentFilter };

    if (attribute === "field") {
      updatedFilter = {
        ...{ filter: "", value: "", type: value.type },
      };
    }

    const attributeValue = attribute === "field" ? value.field : value;
    updatedFilter = {
      ...updatedFilter,
      [attribute]: attributeValue,
      ...(attribute === "filter" && { value: "" }),
    };

    setCurrentFilter(updatedFilter);

    setFilters((prevFilters) => {
      const updatedRows = [...prevFilters];
      updatedRows[index] = { ...updatedFilter };
      return updatedRows;
    });
  };

  const removeFilter = () => {
    const newArray = [...filters];
    newArray.splice(index, 1);
    setFilters(newArray.length === 0 ? [CLEARED_STATE_FILTER] : newArray);
  };

  const renderInputBasedOnType = (type) => {
    const commonProps = {
      module: "core",
      label: "core.advancedFilters.value",
      value: currentFilter.value,
      onChange: onAttributeChange("value"),
    };

    switch (type) {
      case BOOLEAN:
        return <SelectInput options={BOOL_OPTIONS} {...commonProps} />;
      case INTEGER:
        return <NumberInput min={0} displayZero {...commonProps} />;
      case STRING:
      default:
        if (currentFilter.field.toLowerCase().includes(DATE)) {
          return <PublishedComponent pubRef="core.DatePicker" {...commonProps} />;
        } else {
          return <TextInput {...commonProps} />;
        }
    }
  };

  return (
    <StyledGrid container direction="row" className="item">
      {filters.length > 0 ? (
        <div className="removeIconContainer">
          <span className="removeIcon" onClick={removeFilter}>
            &#x2716;
          </span>
        </div>
      ) : (
        <></>
      )}
      <Grid size={3} className="item">
        <CustomFilterFieldStatusPicker
          module="core"
          label="core.advancedFilters.field"
          value={{ field: currentFilter.field, type: currentFilter.type }}
          onChange={onAttributeChange("field")}
          customFilters={customFilters}
        />
      </Grid>
      {currentFilter.field !== "" ? (
        <Grid size={3} className="item">
          <CustomFilterTypeStatusPicker
            module="core"
            label="core.advancedFilters.filter"
            value={currentFilter.filter}
            onChange={onAttributeChange("filter")}
            customFilters={customFilters}
            customFilterField={currentFilter.field}
          />
        </Grid>
      ) : (
        <></>
      )}
      {currentFilter.field !== "" && currentFilter.filter !== "" ? (
        <Grid size={3} className="item">
          {renderInputBasedOnType(currentFilter.type)}
        </Grid>
      ) : (
        <></>
      )}
    </StyledGrid>
  );
};

export { StyledGrid };
export default injectIntl(connect(null, null)(AdvancedFilterRowValue));
