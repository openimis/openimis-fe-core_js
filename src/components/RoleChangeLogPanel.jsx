import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import Table from "./generics/Table";
import ProgressOrError from "./generics/ProgressOrError";
import withModulesManager from "../helpers/modules";
import { formatMessage, formatDateTimeFromISO } from "../helpers/i18n";
import { formatRoleLabel } from "../helpers/role-label-formatter";
import { fetchModulesPermissions, fetchRoleChangeLog } from "../actions";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, ROLE_CHANGE_LOG_TYPE, SYSTEM_AUDIT_USER_ID } from "../constants";

const EMPTY_VALUE = "";
const PYTHON_TRUE = "True";
const PYTHON_FALSE = "False";

const StyledRoleChangeLogPanel = styled("div")(({ theme }) => ({
  "& .paper": theme.paper?.paper ?? {},
  "& .item": theme.paper?.item ?? {},
}));

class RoleChangeLogPanel extends Component {
  state = {
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  componentDidMount() {
    const { fetchedModulePermissions, fetchingModulePermissions, fetchModulesPermissions } = this.props;
    if (!fetchedModulePermissions && !fetchingModulePermissions) {
      fetchModulesPermissions();
    }
    this.query();
  }

  componentDidUpdate(prevProps) {
    const mutationFinished = !!prevProps.submittingMutation && !this.props.submittingMutation;
    if (prevProps.roleUuid !== this.props.roleUuid || mutationFinished) {
      this.setState({ page: 0 }, this.query);
    }
  }

  query = () => {
    const { roleUuid, isDuplicate, fetchRoleChangeLog } = this.props;
    if (!roleUuid || !!isDuplicate) return;
    const { page, pageSize } = this.state;
    fetchRoleChangeLog(roleUuid, pageSize, page * pageSize);
  };

  onChangePage = (event, page) => this.setState({ page }, this.query);

  onChangeRowsPerPage = (pageSize) => this.setState({ pageSize, page: 0 }, this.query);

  translation = (id, fallback) => {
    const { intl } = this.props;
    const key = `core.${id}`;
    return !!intl.messages[key] ? intl.formatMessage({ id: key }) : fallback;
  };

  rightsByValue = () => {
    const { modulePermissions } = this.props;
    if (this.rightsSource !== modulePermissions) {
      this.rightsSource = modulePermissions;
      this.rights = new Map(
        (modulePermissions ?? [])
          .map(({ moduleName, permissions }) =>
            permissions.map(({ permsValue, permsName }) => [String(permsValue), { moduleName, permsName }]),
          )
          .flat(),
      );
    }
    return this.rights;
  };

  rightLabel = (rightId) => {
    const right = this.rightsByValue().get(String(rightId));
    if (!right) return rightId ?? EMPTY_VALUE;
    const { intl } = this.props;
    const key = `${right.moduleName}.${right.permsName}`;
    return !!intl.messages[key]
      ? intl.formatMessage({ id: key })
      : formatRoleLabel(right.moduleName, right.permsName, true);
  };

  fieldLabel = (field) => (!field ? EMPTY_VALUE : this.translation(`roleManagement.changeLog.field.${field}`, field));

  changeTypeLabel = (changeType) => this.translation(`roleManagement.changeLog.type.${changeType}`, changeType);

  attributeValue = (value) => {
    const { intl } = this.props;
    if (!value) return EMPTY_VALUE;
    if (value === PYTHON_TRUE) return formatMessage(intl, "core", "roleManagement.true");
    if (value === PYTHON_FALSE) return formatMessage(intl, "core", "roleManagement.false");
    return value;
  };

  detail = (entry) => {
    switch (entry.changeType) {
      case ROLE_CHANGE_LOG_TYPE.ATTRIBUTE_CHANGED:
        return `${this.fieldLabel(entry.field)}: ${this.attributeValue(entry.oldValue)} → ${this.attributeValue(
          entry.newValue,
        )}`;
      case ROLE_CHANGE_LOG_TYPE.RIGHT_GRANTED:
      case ROLE_CHANGE_LOG_TYPE.RIGHT_REVOKED:
        return this.rightLabel(entry.newValue);
      default:
        return entry.newValue ?? EMPTY_VALUE;
    }
  };

  author = (entry) => {
    const { intl } = this.props;
    if (entry.auditUserId === SYSTEM_AUDIT_USER_ID) {
      return formatMessage(intl, "core", "roleManagement.changeLog.author.system");
    }
    if (!!entry.auditUserName) return entry.auditUserName;
    if (!!entry.auditUserId) return `#${entry.auditUserId}`;
    return formatMessage(intl, "core", "roleManagement.changeLog.author.unknown");
  };

  headers = () => [
    "roleManagement.changeLog.timestamp",
    "roleManagement.changeLog.changeType",
    "roleManagement.changeLog.detail",
    "roleManagement.changeLog.author",
  ];

  itemFormatters = () => {
    const { intl, modulesManager } = this.props;
    return [
      (entry) => (!!entry.timestamp ? formatDateTimeFromISO(modulesManager, intl, entry.timestamp) : EMPTY_VALUE),
      (entry) => this.changeTypeLabel(entry.changeType),
      (entry) => this.detail(entry),
      (entry) => this.author(entry),
    ];
  };

  render() {
    const {
      intl,
      roleUuid,
      isDuplicate,
      roleChangeLog,
      roleChangeLogTotalCount,
      fetchingRoleChangeLog,
      errorRoleChangeLog,
    } = this.props;
    if (!roleUuid || !!isDuplicate) return null;
    return (
      <StyledRoleChangeLogPanel>
        <Paper className="paper">
          <ProgressOrError progress={fetchingRoleChangeLog} error={errorRoleChangeLog} />
          <Table
            module="core"
            header={formatMessage(intl, "core", "roleManagement.changeLog.title")}
            headers={this.headers()}
            itemFormatters={this.itemFormatters()}
            items={roleChangeLog ?? []}
            withPagination
            page={this.state.page}
            pageSize={this.state.pageSize}
            count={roleChangeLogTotalCount}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onChangePage={this.onChangePage}
            onChangeRowsPerPage={this.onChangeRowsPerPage}
          />
        </Paper>
      </StyledRoleChangeLogPanel>
    );
  }
}

const mapStateToProps = (state) => ({
  roleChangeLog: state.core.roleChangeLog,
  roleChangeLogTotalCount: state.core.roleChangeLogTotalCount,
  fetchingRoleChangeLog: state.core.fetchingRoleChangeLog,
  errorRoleChangeLog: state.core.errorRoleChangeLog,
  modulePermissions: state.core.modulePermissions,
  fetchingModulePermissions: state.core.fetchingModulePermissions,
  fetchedModulePermissions: state.core.fetchedModulePermissions,
  submittingMutation: state.core.submittingMutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchModulesPermissions, fetchRoleChangeLog }, dispatch);
};

export { StyledRoleChangeLogPanel };
export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(RoleChangeLogPanel)));
