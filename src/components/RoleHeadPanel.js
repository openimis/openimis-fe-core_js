import React, { Fragment } from "react";
import { connect } from "react-redux";

import { Checkbox, Divider, FormControlLabel, Grid } from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";

import {
  formatMessage,
  FormattedMessage,
  FormPanel,
  TextInput,
  ValidatedTextInput,
  withModulesManager,
} from "@openimis/fe-core";
import { roleNameValidationCheck, roleNameValidationClear, roleNameSetValid } from "../actions";

const styles = (theme) => ({
  item: theme.paper.item,
});

class RoleHeadPanel extends FormPanel {
  shouldValidate = (inputValue) => {
    const { savedRoleName } = this.props;
    return inputValue !== savedRoleName;
  };
  render() {
    const { intl, classes, edited, isRequiredFieldsEmpty, isReadOnly, isRoleNameValid, roleNameValidationError } =
      this.props;
    return (
      <Fragment>
        <Divider />
        {isRequiredFieldsEmpty && (
          <Fragment>
            <div className={classes.item}>
              <FormattedMessage module="core" id="roleManagement.requiredFieldsEmptyError" />
            </div>
            <Divider />
          </Fragment>
        )}
        <Grid container>
          <Grid item className={classes.item}>
            <ValidatedTextInput
              itemQueryIdentifier="roleName"
              codeTakenLabel={"core.roleManagement.duplicateButton.tooltip"}
              shouldValidate={this.shouldValidate}
              isValid={isRoleNameValid}
              validationError={roleNameValidationError}
              action={roleNameValidationCheck}
              clearAction={roleNameValidationClear}
              setValidAction={roleNameSetValid}
              module="core"
              label="roleManagement.roleName"
              value={!!edited && !!edited.name ? edited.name : ""}
              onChange={(v) => this.updateAttribute("name", v)}
              required
              readOnly={!!isReadOnly}
            />
          </Grid>
          <Grid item className={classes.item}>
            <TextInput
              module="core"
              label="roleManagement.altLanguage"
              value={!!edited && !!edited.altLanguage ? edited.altLanguage : ""}
              onChange={(v) => this.updateAttribute("altLanguage", v)}
              readOnly={!!isReadOnly}
            />
          </Grid>
          <Grid item className={classes.item}>
            <FormControlLabel
              label={formatMessage(intl, "core", "roleManagement.isSystem")}
              control={
                <Checkbox
                  checked={!!edited && !!edited.isSystem && edited.isSystem}
                  onChange={(event) => this.updateAttribute("isSystem", event.target.checked)}
                  disabled
                />
              }
            />
          </Grid>
          <Grid item className={classes.item}>
            <FormControlLabel
              label={formatMessage(intl, "core", "roleManagement.isBlocked")}
              control={
                <Checkbox
                  checked={!!edited && !!edited.isBlocked && edited.isBlocked}
                  onChange={(event) => this.updateAttribute("isBlocked", event.target.checked)}
                  disabled={!!isReadOnly}
                />
              }
            />
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  isRoleNameValid: state.core.validationFields?.roleName?.isValid,
  isRoleNameValidating: state.core.validationFields?.roleName?.isValidating,
  roleNameValidationError: state.core.validationFields?.roleName?.validationError,
  savedRoleName: state.core?.role?.name,
});

export default withModulesManager(connect(mapStateToProps)(withTheme(withStyles(styles)(RoleHeadPanel))));
