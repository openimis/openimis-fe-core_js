import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  PublishedComponent,
  TextInput,
  NumberInput,
  SelectInput,
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import CustomFilterFieldStatusPicker from "../../pickers/CustomFilterFieldStatusPicker";
import CustomFilterTypeStatusPicker from "../../pickers/CustomFilterTypeStatusPicker";
import { 
  BOOL_OPTIONS, 
  CLEARED_STATE_FILTER,
  INTEGER,
  DATE,
  STRING,
  BOOLEAN
} from "../../constants";

const styles = (theme) => ({
  item: theme.paper.item,
});

const AdvancedFilterRowValue = ({
  intl,
  classes,
  customFilters,
  currentFilter,
  setCurrentFilter,
  index,
  filters,
  setFilters,
}) => {

  const onAttributeChange = (attribute) => (value) => {
    let updatedFilter = { ...currentFilter };
  
    if (attribute === 'field') {
      updatedFilter = {
        ...{ filter: '', value: '', type: value.type },
      };
    }
  
    const attributeValue = attribute === 'field' ? value.field : value;
    updatedFilter = {
      ...updatedFilter,
      [attribute]: attributeValue,
      ...(attribute === 'filter' && { value: '' }),
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
        return (
          <SelectInput
            options={BOOL_OPTIONS}
            {...commonProps}
          />
        );
      case INTEGER:
        return (
          <NumberInput
            min={0}
            displayZero
            {...commonProps}
          />
        );
      case STRING:
      default:
        if (currentFilter.field.toLowerCase().includes(DATE)) {
          return (
            <PublishedComponent
              pubRef="core.DatePicker"
              {...commonProps}
            />
          );
        } else {
          return (
            <TextInput
              {...commonProps}
            />
          );
        }
    }
  };

  return (
    <Grid 
      container 
      direction="row" 
      className={classes.item}
      style={{ backgroundColor: "#DFEDEF" }}
    >
      {filters.length > 0 ? (
        <div style={{ backgroundColor: '#DFEDEF', width: '25px', height: '25px', marginTop: '25px' }}>
          <span
            style={{
              transform: 'translate(-50%, -50%)',
              fontSize: '16px',
              color: '#006273',
            }}
            onClick={removeFilter}
          >
            &#x2716;
          </span>
        </div> 
      ) : (<></>)
      }
      <Grid item xs={3} className={classes.item}>
        <CustomFilterFieldStatusPicker
          module="core"
          label="core.advancedFilters.field"
          value={{ field: currentFilter.field, type: currentFilter.type }}
          onChange={onAttributeChange("field")}
          customFilters={customFilters}
        />
      </Grid>
        {currentFilter.field !== "" ? (
          <Grid item xs={3} className={classes.item}>
            <CustomFilterTypeStatusPicker
              module="core"
              label="core.advancedFilters.filter"
              value={currentFilter.filter}
              onChange={onAttributeChange("filter")}
              customFilters={customFilters}
              customFilterField={currentFilter.field}
            />
          </Grid>
        ) : (<></>) }
        {currentFilter.field !== "" && currentFilter.filter !== "" ? (
          <Grid item xs={3} className={classes.item}>
            {renderInputBasedOnType(currentFilter.type)}
          </Grid>
        ) : (<></>) }
    </Grid>
  );
};

export default injectIntl(withTheme(withStyles(styles)(connect(null, null)(AdvancedFilterRowValue))));
