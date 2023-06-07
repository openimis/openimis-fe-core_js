import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  FormattedMessage,
  formatMessageWithValues,
  formatMessage,
} from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AdvancedFilterRowValue from "./AdvancedFilterRowValue";
import { fetchCustomFilter } from "../../actions";
import AddCircle from '@material-ui/icons/Add';
import { BENEFIT_PLAN, CLEARED_STATE_FILTER } from "../../constants";

const styles = (theme) => ({
  item: theme.paper.item,
});

const AdvancedFiltersDialog = ({
  intl,
  classes,
  object,
  fetchCustomFilter,
  fetchingCustomFilters,
  errorCustomFilters,
  fetchedCustomFilters,
  customFilters,
  moduleName,
  objectType,
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({ field: "", filter: "", type: "", value: "" })
  const [filters, setFilters] = useState([currentFilter]);

  const createParams = (moduleName, objectTypeName, uuidOfObject=null) => {
    return [
      `moduleName: "${moduleName}"`,
      `objectTypeName: "${objectTypeName}"`,
      uuidOfObject !== null ? `uuidOfObject: "${uuidOfObject}"`: ``,
    ];
  };

  const fetchFilters = (params) => fetchCustomFilter(params);
  
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setFilters([CLEARED_STATE_FILTER]);
    setIsOpen(false);
  };

  const handleRemoveFilter = (index) => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setFilters([CLEARED_STATE_FILTER]);
  };

  const handleAddFilter = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setFilters([...filters, CLEARED_STATE_FILTER]);
  };

  const applyFilter = () => {
    // TODO - apply filter to current context
    handleClose();
  };

  useEffect(() => {
    if (object) {
      // Update the state with new parameters
      let paramsToFetchFilters = []
      if (objectType === BENEFIT_PLAN) {
        paramsToFetchFilters = createParams(
          moduleName,
          objectType,
          object.id
        );
      } else {
        paramsToFetchFilters = createParams(
          moduleName,
          objectType,
        );
      }
      fetchFilters(paramsToFetchFilters);
    }
  }, [object]);
 
  // refresh component when list of filters is changed
  useEffect(() => {}, [filters]);

  return (
    <>
      <Button 
        onClick={handleOpen} 
        variant="outlined" 
        color="#DFEDEF" 
        className={classes.button}
        style={{ 
          border: "0px", 
        }}
      >
        {formatMessage(intl, "core", "advancedFilters")}
      </Button>
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
          Advanced filters
        </DialogTitle>
        <DialogContent>
          {filters.map((filter, index) => {
            return (<AdvancedFilterRowValue 
              customFilters={customFilters}
              currentFilter={filter}
              setCurrentFilter={setCurrentFilter}
              index={index}
              filters={filters}
              setFilters={setFilters}
            />)
          })}
          <div 
            style={{ backgroundColor: "#DFEDEF", paddingLeft: "10px", paddingBottom: "10px" }}
          >
            <AddCircle 
              style={{ 
                border: "thin solid", 
                borderRadius: "40px", 
                width: "16px", 
                height: "16px" 
              }} 
              onClick={handleAddFilter}
            />
            <Button 
              onClick={handleAddFilter} 
              variant="outlined"
              style={{ 
                border: "0px", 
                "marginBottom": "6px", 
                fontSize: "0.8rem" 
              }}
            >
              Add Filter
            </Button>
          </div>
        </DialogContent>
        <DialogActions 
          style={{ 
            display: "inline", 
            paddingLeft: "10px",
            marginTop: "25px",
            marginBottom: "15px"  
          }}
        >
          <div>
            <div style={{ float: "left" }}>
              <Button 
                onClick={handleRemoveFilter} 
                variant="outlined"
                style={{ border: "0px" }}
              >
                Clear All Filters
              </Button>
            </div>
            <div style={{ 
                float: "right", 
                paddingRight: "16px" 
              }}
            >
              <Button 
                onClick={handleClose} 
                variant="outlined" 
                autoFocus
                style={{ margin: "0 16px" }} 
              >
                Cancel
              </Button>
              <Button 
                onClick={applyFilter} 
                variant="contained" 
                color="primary" 
                autoFocus
              >
                Filter
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
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

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchCustomFilter,
}, dispatch);

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AdvancedFiltersDialog))));
