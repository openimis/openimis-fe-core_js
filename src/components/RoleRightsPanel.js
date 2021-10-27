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
});

const RIGHT_NAME_WORDS_SEPARATOR = "_";
const RIGHT_NAME_OMITTED_WORDS = ["gql", "mutation", "perms"];
const QUERY_STRING = "query";
const SEARCH_STRING = "search";
const WHITESPACE = " ";

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
      const rightNameWords = permsName
        .split(RIGHT_NAME_WORDS_SEPARATOR)
        .filter((word) => !RIGHT_NAME_OMITTED_WORDS.includes(word));
      const rightNameLabel = rightNameWords.join(WHITESPACE).replace(QUERY_STRING, SEARCH_STRING);
      const moduleNameLabel = moduleName.split(RIGHT_NAME_WORDS_SEPARATOR).join(WHITESPACE);
      return `${moduleNameLabel} | ${rightNameLabel}`;
    }
    return translatedMessage;
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
                <Typography variant="h6">
                  <FormattedMessage module="core" id="roleManagement.role.availableRights" />
                </Typography>
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
                            this.isFilterMatched(modulePermission.moduleName, permission.permsName)
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
                        ))
                    )}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <Grid item className={classes.item}>
                <Typography variant="h6">
                  <FormattedMessage module="core" id="roleManagement.role.chosenRights" />
                </Typography>
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
                            this.isFilterMatched(modulePermission.moduleName, permission.permsName)
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
                        ))
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
