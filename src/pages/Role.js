import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import _ from "lodash";
import clsx from "clsx";

import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  withModulesManager,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  journalize,
  Form,
  coreConfirm,
  Helmet,
} from "@openimis/fe-core";
import { createRole, updateRole, fetchRole, fetchRoleRights } from "../actions";
import { RIGHT_ROLE_SEARCH, RIGHT_ROLE_CREATE, RIGHT_ROLE_UPDATE, QUERY_STRING_DUPLICATE } from "../constants";
import { prepareForComparison } from "../helpers/utils";
import RoleHeadPanel from "../components/RoleHeadPanel";
import RoleRightsPanel from "../components/RoleRightsPanel";

const styles = (theme) => ({
  page: theme.page,
  locked: theme.page.locked,
});

class Role extends Component {
  state = {
    role: {
      isSystem: false,
      isBlocked: false,
      roleRights: [],
    },
    reset: 0,
    isLocked: false,
  };

  componentDidMount() {
    if (!!this.props.roleUuid) {
      this.setState(
        (_, props) => ({
          isDuplicate: new URLSearchParams(props.location.search).has(QUERY_STRING_DUPLICATE),
        }),
        () => {
          this.props.fetchRole([`uuid: "${this.props.roleUuid}"`]);
          this.props.fetchRoleRights([`role_Uuid: "${this.props.roleUuid}"`]);
        },
      );
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedRole !== this.props.fetchedRole && !!this.props.fetchedRole) {
      this.setState((state, props) => ({
        role: {
          ...props.role,
          name: state.isDuplicate ? null : props.role.name,
          altLanguage: state.isDuplicate ? null : props.role.altLanguage,
          isSystem: state.isDuplicate ? false : !!props.role.isSystem,
          isBlocked: state.isDuplicate ? false : !!props.role.isBlocked,
          roleRights: state.role.roleRights,
        },
        reset: state.reset + 1,
        isSystemRole: state.isDuplicate ? false : !!props.role.isSystem,
      }));
    } else if (prevProps.fetchedRoleRights !== this.props.fetchedRoleRights && !!this.props.fetchedRoleRights) {
      this.setState((state, props) => ({
        role: {
          ...state.role,
          roleRights: props.roleRights.map((right) => right["rightId"]),
        },
      }));
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      if (!!this.state.role.uuid && !this.state.isDuplicate) {
        this.props.fetchRole([`uuid: "${this.state.role.uuid}"`]);
        this.props.fetchRoleRights([`role_Uuid: "${this.props.roleUuid}"`]);
      } else {
        this.setState({ isDuplicate: false }, () =>
          this.props.fetchRole([`clientMutationId: "${this.props.mutation.clientMutationId}"`]),
        );
      }
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  save = (role) => {
    const { intl, createRole, updateRole, coreConfirm } = this.props;
    if (!!role.id && !this.state.isDuplicate) {
      const confirm = () =>
        coreConfirm(
          formatMessageWithValues(intl, "core", "roleManagement.updateRole.confirm.title", { label: role.name }),
          formatMessageWithValues(intl, "core", "roleManagement.updateRole.confirm.message", { label: role.name }),
        );
      const confirmedAction = () => {
        updateRole(
          role,
          formatMessageWithValues(intl, "core", "roleManagement.UpdateRole.mutationLabel", this.titleParams(role)),
        );
      };
      this.setState({ confirmedAction }, confirm);
    } else if (!!role.id && this.state.isDuplicate) {
      delete role["id"];
      delete role["uuid"];
      this.setState((state) => ({
        ...state,
        isLocked: true,
      }));
      createRole(
        role,
        formatMessageWithValues(intl, "core", "roleManagement.DuplicateRole.mutationLabel", {
          label: this.props.role.name,
        }),
      );
    } else {
      this.setState((state) => ({
        ...state,
        isLocked: true,
      }));
      createRole(
        role,
        formatMessageWithValues(intl, "core", "roleManagement.CreateRole.mutationLabel", this.titleParams(role)),
      );
    }
  };

  back = () => this.props.history.goBack();

  isFormLocked = () => this.state.isLocked;

  isRequiredFieldsEmpty = () => !(!!this.state.role && !!this.state.role.name);

  isFormValid = () => this.props.isRoleNameValid && !this.props.isRoleNameValidating;

  doesRoleChange = () => {
    const { roleRights } = this.state.role;
    const { stateRole, propsRole, convertedRoleRights } = prepareForComparison(
      this.state.role,
      this.props.role,
      this.props.roleRights,
    );

    if (!_.isEqual(propsRole, stateRole)) return true;
    if (!_.isEqual(_.sortBy(convertedRoleRights), _.sortBy(roleRights))) return true;

    return false;
  };

  canSave = () => !this.isRequiredFieldsEmpty() && this.isFormValid() && this.doesRoleChange() && !this.isFormLocked();

  onEditedChanged = (role) => this.setState({ role });

  titleParams = (role) => ({ label: !!role && !!role.name ? role.name : null });

  render() {
    const { intl, rights, classes, roleUuid } = this.props;
    return (
      rights.includes(RIGHT_ROLE_SEARCH) &&
      rights.includes(RIGHT_ROLE_CREATE) && (
        <div className={clsx(classes.page, this.state.isLocked && classes.locked)}>
          <Helmet
            title={formatMessageWithValues(
              this.props.intl,
              "core",
              "roleManagement.role.page.title",
              this.titleParams(this.state.role),
            )}
          />
          <Form
            module="core"
            title="roleManagement.role.page.title"
            titleParams={this.titleParams(this.state.role)}
            edited={this.state.role}
            back={this.back}
            canSave={this.canSave}
            save={this.save}
            onEditedChanged={this.onEditedChanged}
            HeadPanel={RoleHeadPanel}
            Panels={[RoleRightsPanel]}
            isRequiredFieldsEmpty={this.isRequiredFieldsEmpty()}
            saveTooltip={formatMessage(
              intl,
              "core",
              `roleManagement.saveButton.tooltip.${this.canSave() ? "enabled" : "disabled"}`,
            )}
            isReadOnly={!!this.state.isSystemRole || !rights.includes(RIGHT_ROLE_UPDATE) || this.state.isLocked}
            reset={this.state.reset}
            roleUuid={roleUuid}
            openDirty={rights.includes(RIGHT_ROLE_UPDATE) ? this.save : null}
          />
        </div>
      )
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  roleUuid: props.match.params.role_uuid,
  fetchedRole: state.core.fetchedRole,
  role: state.core.role,
  fetchedRoleRights: state.core.fetchedRoleRights,
  roleRights: state.core.roleRights,
  submittingMutation: state.core.submittingMutation,
  mutation: state.core.mutation,
  confirmed: state.core.confirmed,
  isRoleNameValid: state.core.validationFields?.roleName?.isValid,
  isRoleNameValidating: state.core.validationFields?.roleName?.isValidating,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createRole, updateRole, fetchRole, fetchRoleRights, journalize, coreConfirm }, dispatch);
};

export default withHistory(
  withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Role))))),
);
