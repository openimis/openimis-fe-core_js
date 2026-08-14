import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import _ from "lodash"

import { useTheme, styled } from "@mui/material/styles";
import GetIconComponent from "../../helpers/icons";
const ReplayIcon = GetIconComponent("Replay");

import {
  Helmet,
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  Form,
  ProgressOrError,
  journalize,
  coreConfirm,
  parseData,
} from "@openimis/fe-core";
import {
  CLAIM_ADMIN_USER_TYPE,
  ENROLMENT_OFFICER_USER_TYPE,
  INTERACTIVE_USER_TYPE,
  RIGHT_USERS,
  RIGHT_CLAIMADMINISTRATOR,
  RIGHT_ENROLMENTOFFICER,
} from "../constants";
import EnrolmentOfficerFormPanel from "./EnrolmentOfficerFormPanel";
import ClaimAdministratorFormPanel from "./ClaimAdministratorFormPanel";
import {
  fetchUser,
  createUser,
  clearUser,
  fetchUserMutation,
  fetchRegionDistricts,
  fetchObligatoryUserFields,
  fetchObligatoryEnrolmentOfficerFields,
  fetchUsernameLength,
  fetchPasswordPolicy,
} from "../actions";
import UserMasterPanel from "./UserMasterPanel";

const StyledDiv = styled("div")(({ theme }) => ({
  "&.locked": theme.page?.locked ?? {},
}));

const USER_OVERVIEW_MUTATIONS_KEY = "user.UserOverview.mutations";

const setupState = (props) => ({
  isLocked: false,
  user: !props?.userId
    ? {
        userTypes: [INTERACTIVE_USER_TYPE],
      }
    : props.user,
  isSaved: false,
  reset: 0,
});

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = setupState(props);
  }

  componentDidMount() {
    if (this.props.userId) {
      this.props.fetchUser(this.props.modulesManager, this.props.userId);
    }
    if (!this.state.obligatory_user_fields) {
      this.props.fetchObligatoryUserFields();
    }
    if (!this.state.obligatory_eo_fields) {
      this.props.fetchObligatoryEnrolmentOfficerFields();
    }
    if (!this.state.usernameLength) {
      this.props.fetchUsernameLength();
    }
    if (!this.state.passwordPolicy) {
      this.props.fetchPasswordPolicy();
    }
  }

  componentWillUnmount() {
    this.props.clearUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.region_districts !== this.props.region_districts) {
      if (this.props.region_districts) {
        const combined = [
          ...(this.state.user.districts ? this.state.user.districts : []),
          ...this.props.region_districts,
        ];

        const noDuplicates = [...new Map(combined.map((x) => [x.uuid, x])).values()];

        this.setState((prevState) => ({
          user: {
            ...prevState.user,
            districts: noDuplicates,
            region: [],
          },
        }));
      }
    }

    if (!prevProps.fetchedUser && this.props.fetchedUser) {
      this.setState(setupState(this.props));
    } else if (prevProps.userId && !this.props.userId) {
      this.setState(setupState(this.props));
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        user: {
          ...state.user,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  reload = async () => {
    const { isSaved } = this.state;
    // eslint-disable-next-line no-shadow
    const { modulesManager, history, mutation, fetchUserMutation, userId, fetchUser } = this.props;

    if (userId) {
      try {
        await fetchUser(modulesManager, userId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[RELOAD_USER]: Fetching user details failed. ${error}`);
      }
      this.setState((state) => ({ ...state, reset: state.reset + 1 }));
      return;
    }

    if (isSaved) {
      try {
        const { clientMutationId } = mutation;
        const response = await fetchUserMutation(modulesManager, clientMutationId);
        const createdUserId = parseData(response.payload.data.mutationLogs)[0].users[0].coreUser.id;

        await fetchUser(modulesManager, createdUserId);
        historyPush(modulesManager, history, "admin.userOverview", [createdUserId]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[RELOAD_USER]: Fetching user details failed. ${error}`);
      }
      this.setState((state) => ({ ...state, reset: state.reset + 1 }));
      return;
    }

    this.setState(setupState(this.props));
  };

  doesUserChange = () => _.isEqual(this.props.user, this.state.user);

  canSave = () => {
    const { user } = this.state;

    if (!user) return false;
    if (this.doesUserChange()) return false;
    if (
      !(
        user.lastName &&
        user.otherNames &&
        user.username &&
        user.email &&
        this.props.isUserNameValid === true &&
        this.props.isUserEmailValid === true &&
        !this.props.isUserEmailFormatInvalid &&
        user.roles?.length &&
        user.districts?.length > 0 &&
        user.language
      )
    )
      return false;

    if (!user.id && !user.password) return false;
    if (user.password && user.password !== user.confirmPassword) return false;
    if (user.password && !user.isPasswordValid) return false;

    if (user.userTypes?.includes(CLAIM_ADMIN_USER_TYPE) && !user.healthFacility) return false;
    if (user.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && !user.officerVillages) return false;
    if (
      (this.props.obligatory_user_fields?.phone === "M" ||
        (user.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && this.props.obligatory_eo_fields?.phone === "M")) &&
      !user.phoneNumber
    )
      return false;

    return true;
  };

  save = (user) => {
    this.setState({ isLocked: !user?.id, isSaved: true }, this.props.save(user));
  };

  onEditedChanged = (user) => {
    if (user.region) {
      user.region.forEach((region) => {
        this.props.fetchRegionDistricts(region);
      });
    }
    this.setState({ user });
  };

  onActionToConfirm = (title, message, confirmedAction) => {
    this.setState({ confirmedAction }, this.props.coreConfirm(title, message));
  };

  render() {
    const {
      modulesManager,

      state,
      rights,
      userId,
      fetchingUser,
      errorUser,
      readOnly = false,
      add,
      save,
      back,
      obligatoryUserFields,
      obligatoryEoFields,
      usernameLength,
      passwordPolicy,
    } = this.props;
    const { user, isSaved, reset } = this.state;

    if (!rights.includes(RIGHT_USERS)) return null;

    const isInMutation =
      user?.clientMutationId ||
      modulesManager.getContribs(USER_OVERVIEW_MUTATIONS_KEY).some((mutation) => mutation(state));

    const actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !isInMutation && !isSaved,
      },
    ];

    return (
      <StyledDiv className={isInMutation || !!user?.validityTo ? "locked" : null}>
        <Helmet title={formatMessageWithValues(this.props.intl, "admin.user", "UserOverview.title", { label: "" })} />
        <ProgressOrError progress={fetchingUser} error={errorUser} />
        {(!userId || user?.id === userId) && (
          <Form
            module="user"
            title={userId ? "admin.user.UserOverview.title" : "admin.user.UserOverview.newTitle"}
            edited_id={userId}
            edited={user}
            reset={reset}
            back={back}
            add={add}
            openDirty={save}
            readOnly={readOnly || isInMutation || user?.validityTo}
            actions={actions}
            HeadPanel={UserMasterPanel}
            Panels={[
              ...(rights.includes(RIGHT_ENROLMENTOFFICER) ? [EnrolmentOfficerFormPanel] : []),
              ...(rights.includes(RIGHT_CLAIMADMINISTRATOR) ? [ClaimAdministratorFormPanel] : []),
            ]}
            user={user}
            onEditedChanged={this.onEditedChanged}
            canSave={!user.validityTo && this.canSave}
            save={save && !user.validityTo ? this.save : null}
            onActionToConfirm={this.onActionToConfirm}
            obligatory_user_fields={obligatoryUserFields}
            obligatory_eo_fields={obligatoryEoFields}
            usernameLength={usernameLength}
            passwordPolicy={passwordPolicy}
          />
        )}
      </StyledDiv>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingUser: state.admin.fetchingUser,
  errorUser: state.admin.errorUser,
  fetchedUser: state.admin.fetchedUser,
  submittingMutation: state.admin.submittingMutation,
  mutation: state.admin.mutation,
  user: state.admin.user,
  region_districts: state.admin.reg_dst,
  confirmed: state.core.confirmed,
  obligatoryUserFields: state.admin.obligatory_user_fields,
  obligatoryEoFields: state.admin.obligatory_eo_fields,
  isUserNameValid: state.admin.validationFields?.username?.isValid,
  isUserEmailValid: state.admin.validationFields?.userEmail?.isValid,
  usernameLength: state.admin?.usernameLength,
  passwordPolicy: state.admin?.passwordPolicy,
  isUserEmailFormatInvalid: state.admin.validationFields?.userEmailFormat?.isInvalid,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUser,
      createUser,
      clearUser,
      fetchUserMutation,
      fetchRegionDistricts,
      fetchObligatoryUserFields,
      fetchObligatoryEnrolmentOfficerFields,
      fetchUsernameLength,
      fetchPasswordPolicy,
      journalize,
      coreConfirm,
    },
    dispatch,
  );

export { StyledDiv };
export { UserForm };
export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserForm))));
