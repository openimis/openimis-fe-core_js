import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import { formatMessage } from "../../helpers/i18n";
import SearcherActionButton from "../generics/SearcherActionButton";
import { styled } from "@mui/material/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AdvancedFilterRowValue from "./AdvancedFilterRowValue";
import { fetchCustomFilter } from "../../actions";
import GetIconComponent from "../../helpers/icons";

const AddCircle = GetIconComponent("Add");
const FilterListIcon = GetIconComponent("FilterList");
import { CLEARED_STATE_FILTER, CUSTOM_FILTERS, DOUBLE_UNDERSCORE, EQUALS_SIGN, WHITE_SPACE } from "../../constants";

const StyledDialog = styled("div")(({ theme }) => ({
  "& .item": theme?.paper?.item ?? {},
  "& .paperHeaderAction": {
    ...(theme?.paper?.action ?? {}),
    display: "flex",
    justifyContent: "center",
    itemAlign: "center",
  },
}));

const AdvancedFiltersDialog = ({
  intl,
  object,
  additionalParams,
  fetchCustomFilter,
  customFilters,
  moduleName,
  objectType,
  appliedCustomFilters,
  setAppliedCustomFilters,
  onChangeFilters,
  appliedFiltersRowStructure,
  setAppliedFiltersRowStructure,
  applyNumberCircle,
  searchCriteria,
  deleteFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({ field: "", filter: "", type: "", value: "" });
  const [filters, setFilters] = useState([currentFilter]);

  const searchCriteriaToArray = () => {
    return hasCustomFilters()
      ? JSON.parse(searchCriteria[CUSTOM_FILTERS]?.filter.split(WHITE_SPACE)[1])
      : appliedFiltersRowStructure;
  };

  const jsonFiltersToRowFilters = () => {
    const arrayFilters = searchCriteriaToArray();
    return arrayFilters.map((filterString) => {
      const [field, filter, typeValue] = filterString.split(DOUBLE_UNDERSCORE);
      const [type, value] = typeValue.split(EQUALS_SIGN);
      return {
        field,
        filter,
        type,
        value: JSON.parse(value),
      };
    });
  };

  const createParams = (moduleName, objectTypeName, uuidOfObject = null, additionalParams = null) => {
    let params = [`moduleName: "${moduleName}"`, `objectTypeName: "${objectTypeName}"`];
    if (uuidOfObject) {
      params.push(`uuidOfObject: "${uuidOfObject}"`);
    }
    if (additionalParams) {
      params.push(`additionalParams: ${JSON.stringify(JSON.stringify(additionalParams))}`);
    }
    return params;
  };

  const fetchFilters = (params) => fetchCustomFilter(params);

  const handleOpen = () => {
    hasCustomFilters() && isAppliedFiltersRowStructureEmpty()
      ? setFilters(jsonFiltersToRowFilters())
      : setFilters(appliedFiltersRowStructure);
    setIsOpen(true);
  };

  const isAppliedFiltersRowStructureEmpty = () => {
    const [firstFilter = {}] = appliedFiltersRowStructure;
    return !(firstFilter.filter && firstFilter.field && firstFilter.type);
  };

  const handleClose = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setIsOpen(false);
  };

  const handleRemoveFilter = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setAppliedFiltersRowStructure([CLEARED_STATE_FILTER]);
    setFilters([CLEARED_STATE_FILTER]);
  };

  const handleAddFilter = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setFilters([...filters, CLEARED_STATE_FILTER]);
  };

  const applyFilter = () => {
    setAppliedFiltersRowStructure(filters);
    const outputFilters = JSON.stringify(
      filters.map(({ filter, value, field, type }) => {
        if (type === "integer") {
          return `${field}__${filter}__${type}=${value}`;
        } else {
          return `${field}__${filter}__${type}=${JSON.stringify(value)}`;
        }
      }),
    );

    if (checkArrayFilterStructure() === false) {
      onChangeFilters([
        {
          id: "customFilters",
          outputFilters,
          filter: `customFilters: ${outputFilters}`,
        },
      ]);
      setAppliedCustomFilters(outputFilters);
    } else {
      deleteFilter("customFilters");
    }
    handleClose();
  };

  function checkArrayFilterStructure() {
    if (filters.length === 1) {
      const firstObj = filters[0];
      if (checkFilterFields(firstObj)) {
        return true;
      }
    }
    return false;
  }

  function checkFilterFields(dict) {
    return Object.entries(dict).some(([key, value]) => key !== "value" && (value === null || value === ""));
  }

  function hasCustomFilters() {
    return CUSTOM_FILTERS in searchCriteria;
  }

  useEffect(() => {
    if (objectType) {
      // Update the state with new parameters
      let paramsToFetchFilters = [];
      paramsToFetchFilters = createParams(moduleName, objectType, object ? object?.id : null, additionalParams);
      fetchFilters(paramsToFetchFilters);
    }
  }, [objectType]);

  // refresh component when list of filters is changed
  useEffect(() => {}, [filters]);

  useEffect(() => {
    if (hasCustomFilters() === false) {
      handleRemoveFilter();
    }
  }, [searchCriteria]);

  return (
    <StyledDialog>
      <SearcherActionButton
        startIcon={<FilterListIcon />}
        label={formatMessage(intl, "core", "advancedFilters")}
        onClick={handleOpen}
      />
      {appliedFiltersRowStructure.length > 0 && hasCustomFilters() ? (
        applyNumberCircle(searchCriteriaToArray().length)
      ) : (
        <></>
      )}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 900,
            maxWidth: 900,
          },
        }}
      >
        <DialogTitle
          style={{
            marginTop: "10px",
          }}
        >
          {formatMessage(intl, "core", "advancedFilters.button.AdvancedFilters")}
        </DialogTitle>
        <DialogContent>
          {filters.map((filter, index) => {
            return (
              <AdvancedFilterRowValue
                key={index}
                customFilters={customFilters}
                currentFilter={filter}
                setCurrentFilter={setCurrentFilter}
                index={index}
                filters={filters}
                setFilters={setFilters}
              />
            );
          })}
          <div style={{ backgroundColor: "#DFEDEF", paddingLeft: "10px", paddingBottom: "10px" }}>
            <AddCircle
              style={{
                border: "thin solid",
                borderRadius: "40px",
                width: "16px",
                height: "16px",
              }}
              onClick={handleAddFilter}
            />
            <Button
              onClick={handleAddFilter}
              variant="outlined"
              style={{
                border: "0px",
                "marginBottom": "6px",
                fontSize: "0.8rem",
              }}
            >
              {formatMessage(intl, "core", "core.advancedFilters.button.addFilters")}
            </Button>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "inline",
            paddingLeft: "10px",
            marginTop: "25px",
            marginBottom: "15px",
          }}
        >
          <div>
            <div style={{ float: "left" }}>
              <Button onClick={handleRemoveFilter} variant="outlined" style={{ border: "0px" }}>
                {formatMessage(intl, "core", "core.advancedFilters.button.clearAllFilters")}
              </Button>
            </div>
            <div
              style={{
                float: "right",
                paddingRight: "16px",
              }}
            >
              <Button onClick={handleClose} variant="outlined" autoFocus style={{ margin: "0 16px" }}>
                {formatMessage(intl, "core", "core.advancedFilters.button.cancel")}
              </Button>
              <Button onClick={applyFilter} variant="contained" color="primary" autoFocus>
                {formatMessage(intl, "core", "core.advancedFilters.button.filter")}
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
};

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  confirmed: state.core.confirmed,
  fetchingCustomFilters: state.core.fetchingCustomFilters,
  errorCustomFilters: state.core.errorCustomFilters,
  fetchedCustomFilters: state.core.fetchedCustomFilters,
  customFilters: state.core.customFilters,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchCustomFilter,
    },
    dispatch,
  );

export { StyledDialog };
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(AdvancedFiltersDialog));
