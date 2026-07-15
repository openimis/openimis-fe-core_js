import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Fab } from "@mui/material";
import GetIconComponent from "../../helpers/icons";
const AddIcon = GetIconComponent("Add");
import { useTheme, styled } from "@mui/material/styles";

import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  formatMessage,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { RIGHT_USER_ADD, MODULE_NAME } from "../constants";
import UserSearcher from "../components/UserSearcher";

const StyledDiv = styled("div")(({ theme }) => ({
  ...(theme.page ?? {}),
  "& .fab": theme.fab ?? {},
}));

class UsersPage extends Component {
  onDoubleClick = (u, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "admin.userOverview", [u.id], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "admin.userNew");
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { rights, intl } = this.props;
    return (
      <StyledDiv>
        <UserSearcher cacheFiltersKey="usersPageFiltersCache" onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_USER_ADD) &&
          withTooltip(
            <div className="fab">
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "admin.user", "addNewUser.tooltip"),
          )}
      </StyledDiv>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export { StyledDiv };
export { UsersPage };
export default injectIntl(withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(UsersPage))));
