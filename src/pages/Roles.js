import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Grid, FormControlLabel, Checkbox, Fab, IconButton } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  Helmet,
  TextInput,
  withTooltip,
  historyPush,
  coreConfirm,
  journalize,
  PublishedComponent,
  SelectInput,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { fetchRoles, deleteRole } from "../actions";
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  CONTAINS_LOOKUP,
  LANGUAGE_EN,
  RIGHT_ROLE_SEARCH,
  RIGHT_ROLE_CREATE,
  RIGHT_ROLE_UPDATE,
  RIGHT_ROLE_DUPLICATE,
  RIGHT_ROLE_DELETE,
  QUERY_STRING_DUPLICATE,
  MODULE_NAME,
} from "../constants";

const styles = (theme) => ({
  page: theme.page,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  fab: theme.fab,
});

const DEFAULT_ORDER_BY = "name";

class RawRoleFilter extends Component {
  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (k) => {
    const { filters } = this.props;
    return !!filters[k] ? filters[k].value : "";
  };

  _onChangeFilter = (k, v) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}: ${v}`,
      },
    ]);
  };

  _onChangeStringFilter = (k, v, lookup) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}_${lookup}: "${v}"`,
      },
    ]);
  };

  onChangeRoleRight = (key, value) => {
    this.props.onChangeFilters([
      {
        id: key,
        value,
        filter: `${key}: ${value?.permsValue}`,
      },
    ]);
  };

  booleanOptions = () => {
    const options = [null, "true", "false"];
    return [
      ...options.map((option) => ({
        value: option,
        label: formatMessage(this.props.intl, "core", `roleManagement.${option}`),
      })),
    ];
  };

  render() {
    const { intl, classes } = this.props;
    return (
      <Grid container className={classes.form}>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="core"
            label="roleManagement.roleName"
            value={this._filterTextFieldValue("name")}
            onChange={(v) => this._onChangeStringFilter("name", v, CONTAINS_LOOKUP)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <SelectInput
            module="core"
            label="roleManagement.isSystem"
            options={this.booleanOptions()}
            value={this._filterValue("isSystem")}
            onChange={(v) => this._onChangeFilter("isSystem", v)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <SelectInput
            module="core"
            label="roleManagement.isBlocked"
            options={this.booleanOptions()}
            value={this._filterValue("isBlocked")}
            onChange={(v) => this._onChangeFilter("isBlocked", v)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.AuthorityPicker"
            value={this._filterValue("roleRight")}
            onChange={(roleRight) => this.onChangeRoleRight("roleRight", roleRight)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <FormControlLabel
            label={formatMessage(intl, "core", "roleManagement.showHistory")}
            control={
              <Checkbox
                checked={!!this._filterValue("showHistory")}
                onChange={(event) => this._onChangeFilter("showHistory", event.target.checked)}
              />
            }
          />
        </Grid>
      </Grid>
    );
  }
}

const RoleFilter = injectIntl(withTheme(withStyles(styles)(RawRoleFilter)));

class Roles extends Component {
  state = {
    toDelete: null,
    deleted: [],
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ deleted: state.deleted.concat(state.toDelete) }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  onAdd = () => historyPush(this.props.modulesManager, this.props.history, "core.route.role");

  roleUpdatePageUrl = (role) => `${this.props.modulesManager.getRef("core.route.role")}${"/" + role.uuid}`;

  roleDuplicatePageUrl = (role) => `${this.roleUpdatePageUrl(role)}?${QUERY_STRING_DUPLICATE}`;

  onDoubleClick = (role, newTab = false) => {
    const { rights, modulesManager, history } = this.props;
    if (rights.includes(RIGHT_ROLE_SEARCH) || rights.includes(RIGHT_ROLE_UPDATE)) {
      historyPush(modulesManager, history, "core.route.role", [role.uuid], newTab);
    }
  };

  fetch = (params) => this.props.fetchRoles(params);

  headers = (filters) => {
    const { rights } = this.props;
    let result = [
      "roleManagement.roleName",
      "roleManagement.isSystem",
      "roleManagement.isBlocked",
      filters?.showHistory?.value ? "roleManagement.dateValidFrom" : null,
      filters?.showHistory?.value ? "roleManagement.dateValidTo" : null,
    ];
    [RIGHT_ROLE_UPDATE, RIGHT_ROLE_DUPLICATE, RIGHT_ROLE_DELETE].forEach((right) => {
      if (rights.includes(right)) {
        result.push("roleManagement.emptyLabel");
      }
    });
    return result;
  };

  itemFormatters = (filters) => {
    const { intl, rights, modulesManager, language } = this.props;
    const result = [
      (role) =>
        language === null
          ? role.name
          : language === LANGUAGE_EN
          ? role.name
          : role.altLanguage === null
          ? role.name
          : role.altLanguage,
      (role) => (role.isSystem !== null ? <Checkbox checked={!!role.isSystem} disabled /> : ""),
      (role) => (role.isBlocked !== null ? <Checkbox checked={role.isBlocked} disabled /> : ""),
      (role) =>
        filters?.showHistory?.value && role.validityFrom
          ? formatDateFromISO(modulesManager, intl, role.validityFrom)
          : null,
      (role) =>
        filters?.showHistory?.value && role.validityTo
          ? formatDateFromISO(modulesManager, intl, role.validityTo)
          : null,
    ];
    if (rights.includes(RIGHT_ROLE_SEARCH) || rights.includes(RIGHT_ROLE_UPDATE)) {
      result.push((role) =>
        withTooltip(
          <div>
            <IconButton href={this.roleUpdatePageUrl(role)} disabled={this.isRowDisabled(null, role)}>
              <EditIcon />
            </IconButton>
          </div>,
          formatMessage(intl, "core", "roleManagement.editButton.tooltip"),
        ),
      );
    }
    if (rights.includes(RIGHT_ROLE_DUPLICATE)) {
      result.push((role) =>
        withTooltip(
          <div>
            <IconButton href={this.roleDuplicatePageUrl(role)} disabled={this.isRowDisabled(null, role)}>
              <SupervisedUserCircleIcon />
            </IconButton>
          </div>,
          formatMessage(intl, "core", "roleManagement.duplicateButton.tooltip"),
        ),
      );
    }
    if (rights.includes(RIGHT_ROLE_DELETE)) {
      result.push((role) =>
        withTooltip(
          <div>
            <IconButton onClick={() => this.onDelete(role)} disabled={this.isRowDisabled(null, role)}>
              <DeleteIcon />
            </IconButton>
          </div>,
          formatMessage(intl, "core", "roleManagement.deleteButton.tooltip"),
        ),
      );
    }
    return result;
  };

  onDelete = (role) => {
    const { intl, coreConfirm, deleteRole } = this.props;
    const confirm = () =>
      coreConfirm(
        formatMessageWithValues(intl, "core", "roleManagement.deleteRole.confirm.title", { label: role.name }),
        formatMessage(intl, "core", "roleManagement.deleteRole.confirm.message"),
      );
    const confirmedAction = () => {
      this.setState({ toDelete: role.id }, () =>
        deleteRole(
          role,
          formatMessageWithValues(intl, "core", "roleManagement.DeleteRole.mutationLabel", { label: role.name }),
        ),
      );
    };
    this.setState({ confirmedAction }, confirm);
  };

  sorts = (filters) => [
    ["name", true],
    ["isSystem", true],
    ["isBlocked", true],
    filters?.showHistory?.value ? ["validityFrom", true] : null,
    filters?.showHistory?.value ? ["validityTo", true] : null,
  ];

  isRowDisabled = (_, role) =>
    this.state.deleted.includes(role.id) || (!!role.validityTo && role.validityTo < new Date().toISOString());

  isRowLocked = (_, role) => this.state.deleted.includes(role.id);

  isOnDoubleClickEnabled = (role) => !this.isRowDisabled(_, role);

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { intl, rights, classes, fetchingRoles, fetchedRoles, errorRoles, roles, rolesPageInfo, rolesTotalCount } =
      this.props;
    return (
      rights.includes(RIGHT_ROLE_SEARCH) && (
        <div className={classes.page}>
          <Helmet title={formatMessage(this.props.intl, "core", "roleManagement.label")} />
          <Searcher
            module="core"
            FilterPane={RoleFilter}
            fetch={this.fetch}
            items={roles}
            itemsPageInfo={rolesPageInfo}
            fetchingItems={fetchingRoles}
            fetchedItems={fetchedRoles}
            errorItems={errorRoles}
            tableTitle={formatMessageWithValues(intl, "core", "roleManagement.searcher.results.title", {
              rolesTotalCount,
            })}
            headers={this.headers}
            itemFormatters={this.itemFormatters}
            sorts={this.sorts}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            defaultPageSize={DEFAULT_PAGE_SIZE}
            defaultOrderBy={DEFAULT_ORDER_BY}
            rowLocked={this.isRowLocked}
            rowDisabled={this.isRowDisabled}
            onDoubleClick={(role) => this.isOnDoubleClickEnabled(role) && this.onDoubleClick(role)}
          />
          {rights.includes(RIGHT_ROLE_CREATE) &&
            withTooltip(
              <div className={classes.fab}>
                <Fab color="primary" onClick={this.onAdd}>
                  <AddIcon />
                </Fab>
              </div>,
              formatMessage(intl, "core", "roleManagement.createButton.tooltip"),
            )}
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  language: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.language : null,
  fetchingRoles: state.core.fetchingRoles,
  fetchedRoles: state.core.fetchedRoles,
  errorRoles: state.core.errorRoles,
  roles: state.core.roles,
  rolesPageInfo: state.core.rolesPageInfo,
  rolesTotalCount: state.core.rolesTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.core.submittingMutation,
  mutation: state.core.mutation,
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchRoles, deleteRole, coreConfirm, journalize, clearCurrentPaginationPage }, dispatch);
};

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Roles)))),
);
