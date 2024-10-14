import React, { Fragment } from "react";
import { FormPanel, ProgressOrError, FormattedMessage, formatMessage } from "@openimis/fe-core";
import {
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  InputAdornment,
} from "@material-ui/core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { fetchModulesPermissions } from "../actions";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import SearchIcon from "@material-ui/icons/Search";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import { formatRoleLabel } from "../helpers/role-label-formatter";

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  paperHeader: theme.paper.paperHeader,
  list: {
    width: "100%",
    height: "500px",
    position: "relative",
    overflow: "auto",
  },
  filter: {
    width: "100%",
  },
  listItemText: {
    textTransform: "capitalize",
  },
  reversedArrow: {
    transform: "rotate(180deg)",
  },
  listTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "5px",
  },
});

class RoleRightsPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: "",
    };
  }

  componentDidMount() {
    if (!this.props.fetchedModulePermissions) {
      this.props.fetchModulesPermissions();
    }
  }

  selectRight = (rightId) => {
    const { roleRights, ...rest } = this.props.edited;
    roleRights.push(rightId);
    this.props.onEditedChanged({ roleRights, ...rest });
  };

  unselectRight = (rightId) => {
    const { roleRights, ...rest } = this.props.edited;
    this.props.onEditedChanged({ roleRights: roleRights.filter((id) => id !== rightId), ...rest });
  };

  rightTranslationId = (moduleName, permsName) => `${moduleName}.${permsName}`;

  isFilterMatched = (moduleName, permsName) =>
    this.rightLabel(moduleName, permsName).includes(this.state.filterValue.toLowerCase()) ||
    this.rightTranslationId(moduleName, permsName).includes(this.state.filterValue.toLowerCase());

  rightLabel = (moduleName, permsName) => {
    const translationId = this.rightTranslationId(moduleName, permsName);
    const translatedMessage = formatMessage(this.props.intl, null, translationId);
    const translationFound = translatedMessage !== translationId;
    if (!translationFound) {
      return formatRoleLabel(moduleName, permsName);
    }
    return translatedMessage;
  };

  filterPermissions = (checkAvailableRights = true) => {
    const { modulePermissions, edited } = this.props;
    const { roleRights } = edited;

    const sortedModulePermissions = modulePermissions
      ? modulePermissions.sort((module, otherModule) => module.moduleName > otherModule.moduleName)
      : [];

    const allFilteredPerms = sortedModulePermissions
      .map(({ permissions, moduleName }) =>
        permissions
          .filter(({ permsValue, permsName }) => {
            if (checkAvailableRights) {
              return !roleRights.includes(permsValue) && this.isFilterMatched(moduleName, permsName);
            }

            return this.isFilterMatched(moduleName, permsName);
          })
          .map(({ permsValue }) => permsValue),
      )
      .flat();

    return allFilteredPerms;
  };

  selectAllFilteredPerms = () => {
    const { edited, onEditedChanged } = this.props;
    const { roleRights, ...restState } = edited;

    const filteredPerms = this.filterPermissions();

    onEditedChanged({ roleRights: [...roleRights, ...filteredPerms], ...restState });
  };

  removeAllChosenPerms = () => {
    const { edited, onEditedChanged } = this.props;
    const { filterValue } = this.state;
    const { roleRights, ...restState } = edited;

    if (filterValue) {
      const filteredPerms = this.filterPermissions(false);

      const restPerms = roleRights.filter((right) => !filteredPerms.some((filteredRight) => filteredRight === right));

      onEditedChanged({ roleRights: restPerms, ...restState });
      return;
    }

    onEditedChanged({ roleRights: [], ...restState });
  };

  render() {
    const {
      intl,
      classes,
      edited,
      isReadOnly,
      fetchingModulePermissions,
      fetchedModulePermissions,
      modulePermissions,
      errorModulePermissions,
      fetchingRoleRights,
      fetchedRoleRights,
      errorRoleRights,
      roleUuid,
    } = this.props;
    const sortedModulePermissions = !!modulePermissions
      ? modulePermissions.sort((module, otherModule) => module.moduleName > otherModule.moduleName)
      : [];
    return (
      <Fragment>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item className={classes.item}>
              <Paper>
                <Grid item className={classes.item}>
                  <TextField
                    className={classes.filter}
                    variant="outlined"
                    label={formatMessage(intl, "core", "roleManagement.role.rightsFilter")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    onChange={(e) => this.setState({ filterValue: e.target.value })}
                  />
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={6} className={classes.item}>
              <Grid item className={classes.item}>
                <Grid className={classes.listTitle}>
                  <Typography variant="h6">
                    <FormattedMessage module="core" id="roleManagement.role.availableRights" />
                  </Typography>
                  <Tooltip title={<FormattedMessage module="core" id="roleManagement.role.addAllFilteredPerms" />}>
                    <IconButton color="primary" disabled={isReadOnly} onClick={this.selectAllFilteredPerms}>
                      <DoubleArrowIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Paper>
                <List className={classes.list} subheader={<li />}>
                  <ProgressOrError
                    progress={fetchingModulePermissions || fetchingRoleRights}
                    error={errorModulePermissions || errorRoleRights}
                  />
                  {!!fetchedModulePermissions &&
                    (!!roleUuid ? !!fetchedRoleRights : true) &&
                    !!sortedModulePermissions.length &&
                    sortedModulePermissions.map((modulePermission) =>
                      modulePermission.permissions
                        .filter(
                          (permission) =>
                            !edited.roleRights.includes(permission.permsValue) &&
                            this.isFilterMatched(modulePermission.moduleName, permission.permsName),
                        )
                        .map((permission) => (
                          <ListItem button divider>
                            <ListItemText
                              className={classes.listItemText}
                              primary={this.rightLabel(modulePermission.moduleName, permission.permsName)}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => this.selectRight(permission.permsValue)}
                                disabled={!!isReadOnly}
                              >
                                <ArrowForwardIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )),
                    )}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <Grid item className={classes.item}>
                <Grid className={classes.listTitle}>
                  <Tooltip title={<FormattedMessage module="core" id="roleManagement.role.removeAllPerms" />}>
                    <IconButton color="primary" disabled={isReadOnly} onClick={this.removeAllChosenPerms}>
                      <DoubleArrowIcon className={classes.reversedArrow} />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="h6">
                    <FormattedMessage module="core" id="roleManagement.role.chosenRights" />
                  </Typography>
                </Grid>
              </Grid>
              <Paper>
                <List className={classes.list} subheader={<li />}>
                  <ProgressOrError
                    progress={fetchingModulePermissions || fetchingRoleRights}
                    error={errorModulePermissions || errorRoleRights}
                  />
                  {!!fetchedModulePermissions &&
                    (!!roleUuid ? !!fetchedRoleRights : true) &&
                    !!sortedModulePermissions.length &&
                    sortedModulePermissions.map((modulePermission) =>
                      modulePermission.permissions
                        .filter(
                          (permission) =>
                            edited.roleRights.includes(permission.permsValue) &&
                            this.isFilterMatched(modulePermission.moduleName, permission.permsName),
                        )
                        .map((permission) => (
                          <ListItem button divider>
                            <ListItemText
                              className={classes.listItemText}
                              primary={this.rightLabel(modulePermission.moduleName, permission.permsName)}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => this.unselectRight(permission.permsValue)}
                                disabled={!!isReadOnly}
                              >
                                <ArrowBackIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )),
                    )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingModulePermissions: state.core.fetchingModulePermissions,
  fetchedModulePermissions: state.core.fetchedModulePermissions,
  modulePermissions: state.core.modulePermissions,
  errorModulePermissions: state.core.errorModulePermissions,
  fetchingRoleRights: state.core.fetchingRoleRights,
  fetchedRoleRights: state.core.fetchedRoleRights,
  errorRoleRights: state.core.errorRoleRights,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchModulesPermissions }, dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(RoleRightsPanel))));
