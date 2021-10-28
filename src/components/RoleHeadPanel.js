import React, { Fragment } from "react";
import { formatMessage, FormPanel, FormattedMessage, TextInput } from "@openimis/fe-core";
import { Grid, Divider, FormControlLabel, Checkbox } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  item: theme.paper.item,
});

class RoleHeadPanel extends FormPanel {
  render() {
    const { intl, classes, edited, isRequiredFieldsEmpty, isReadOnly } = this.props;
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
            <TextInput
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

export default injectIntl(withTheme(withStyles(styles)(RoleHeadPanel)));
