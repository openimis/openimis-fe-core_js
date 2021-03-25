import React, { Component } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    Searcher,
    formatDateFromISO,
    TextInput,
    withTooltip,
    historyPush,
    toISODate,
    coreConfirm,
    journalize
} from "@openimis/fe-core";
import {
    Grid,
    FormControlLabel,
    Checkbox,
    Fab,
    IconButton
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchRoles, deleteRole } from "../actions";
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    CONTAINS_LOOKUP,
    LANGUAGE_EN,
    RIGHT_ROLE_SEARCH,
    RIGHT_ROLE_CREATE,
    RIGHT_ROLE_DELETE
} from "../constants";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

const styles = theme => ({
    page: theme.page,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    fab: theme.fab
});

const DEFAULT_ORDER_BY = "name";

class RawRoleFilter extends Component {
    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    _onChangeFilter = (k, v) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}: ${v}`
            }
        ])
    }

    _onChangeStringFilter = (k, v, lookup) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}_${lookup}: "${v}"`
            }
        ])
    }

    render() {
        const { intl, classes } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item className={classes.item}>
                    <TextInput
                        module="core"
                        label="roleManagement.roleName"
                        value={this._filterValue('name')}
                        onChange={v => this._onChangeStringFilter('name', v, CONTAINS_LOOKUP)}
                    />
                </Grid>
                <Grid item className={classes.item}>
                    <FormControlLabel
                        label={formatMessage(intl, "core", "roleManagement.isSystem")}
                        control={<Checkbox 
                            checked={!!this._filterValue('isSystem')}
                            onChange={event => this._onChangeFilter('isSystem', event.target.checked)}
                        />}
                    />
                </Grid>
                <Grid item className={classes.item}>
                    <FormControlLabel
                        label={formatMessage(intl, "core", "roleManagement.isBlocked")}
                        control={<Checkbox 
                            checked={!!this._filterValue('isBlocked')}
                            onChange={event => this._onChangeFilter('isBlocked', event.target.checked)}
                        />}
                    />
                </Grid>
                <Grid item className={classes.item}>
                    <FormControlLabel
                        label={formatMessage(intl, "core", "roleManagement.showHistory")}
                        control={<Checkbox 
                            checked={!!this._filterValue('showHistory')}
                            onChange={event => this._onChangeFilter('showHistory', event.target.checked)}
                        />}
                    />
                </Grid>
            </Grid>
        )
    }
}

const RoleFilter = injectIntl(withTheme(withStyles(styles)(RawRoleFilter)));

class Roles extends Component {
    state = {
        toDelete: null,
        deleted: []
    }

    componentDidMount() {
        document.title = formatMessage(this.props.intl, "core", "roleManagement.label");
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState(state => ({ deleted: state.deleted.concat(state.toDelete) }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    onAdd = () => historyPush(this.props.modulesManager, this.props.history, "core.route.role");

    fetch = params => this.props.fetchRoles(params);

    headers = () => {
        const { rights } = this.props;
        let result = [
            "roleManagement.roleName",
            "roleManagement.isSystem",
            "roleManagement.isBlocked",
            "roleManagement.dateValidFrom",
            "roleManagement.dateValidTo"
        ];
        if (rights.includes(RIGHT_ROLE_DELETE)) {
            result.push("roleManagement.emptyLabel");
        }
        return result;
    }

    itemFormatters = () => {
        const { intl, rights, modulesManager, language } = this.props;
        const result = [
            role => language === null
                ? role.name
                : language === LANGUAGE_EN ? role.name : role.altLanguage,
            role => role.isSystem !== null
                ? <Checkbox checked={!!role.isSystem} disabled/>
                : "",
            role => role.isBlocked !== null
                ? <Checkbox checked={role.isBlocked} disabled/>
                : "",
            role => !!role.validityFrom
                ? formatDateFromISO(modulesManager, intl, role.validityFrom)
                : "",
            role => !!role.validityTo
                ? formatDateFromISO(modulesManager, intl, role.validityTo)
                : ""
        ];
        if (rights.includes(RIGHT_ROLE_DELETE)) {
            result.push(
                role => withTooltip(
                    <div>
                        <IconButton
                            onClick={() => this.onDelete(role)}
                            disabled={this.isRowDisabled(_, role)}>
                            <DeleteIcon/>
                        </IconButton>
                    </div>,
                    formatMessage(intl, "core", "roleManagement.deleteButton.tooltip")
                )
            );
        }
        return result;
    }

    onDelete = role => {
        const { intl, coreConfirm, deleteRole } = this.props;
        const confirm = () => coreConfirm(
            formatMessageWithValues(
                intl,
                "core",
                "roleManagement.deleteRole.confirm.title",
                { label: role.name }
            ),
            formatMessage(
                intl,
                "core",
                "roleManagement.deleteRole.confirm.message"
            )
        );
        const confirmedAction = () => {
            this.setState(
                { toDelete: role.id },
                () => deleteRole(
                    role,
                    formatMessageWithValues(
                        intl,
                        "core",
                        "roleManagement.DeleteRole.mutationLabel",
                        { label: role.name }
                    )
                )
            );
        }
        this.setState({ confirmedAction }, confirm);
    }

    sorts = () => [
        ['name', true],
        ['isSystem', true],
        ['isBlocked', true],
        ['validityFrom', true],
        ['validityTo', true]
    ];

    isRowDisabled = (_, role) =>
        this.state.deleted.includes(role.id) || (
            !!role.validityTo &&
            formatDateFromISO(
                this.props.modulesManager,
                this.props.intl,
                role.validityTo
            )
            < toISODate(new Date()));

    isRowLocked = (_, role) => this.state.deleted.includes(role.id);

    isOnDoubleClickEnabled = role => !this.isRowDisabled(_, role);

    onDoubleClick = () => null;

    render() {
        const {
            intl,
            rights,
            classes,
            fetchingRoles,
            fetchedRoles,
            errorRoles,
            roles,
            rolesPageInfo,
            rolesTotalCount
        } = this.props;
        return (
            rights.includes(RIGHT_ROLE_SEARCH) && (
                <div className={classes.page}>
                    <Searcher
                        module="core"
                        FilterPane={RoleFilter}
                        fetch={this.fetch}
                        items={roles}
                        itemsPageInfo={rolesPageInfo}
                        fetchingItems={fetchingRoles}
                        fetchedItems={fetchedRoles}
                        errorItems={errorRoles}
                        tableTitle={formatMessageWithValues(
                            intl,
                            "core",
                            "roleManagement.searcher.results.title", { rolesTotalCount }
                        )}
                        headers={this.headers}
                        itemFormatters={this.itemFormatters}
                        sorts={this.sorts}
                        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                        defaultPageSize={DEFAULT_PAGE_SIZE}
                        defaultOrderBy={DEFAULT_ORDER_BY}
                        rowLocked={this.isRowLocked}
                        rowDisabled={this.isRowDisabled}
                        onDoubleClick={role => this.isOnDoubleClickEnabled(role) && this.onDoubleClick()}
                    />
                    {rights.includes(RIGHT_ROLE_CREATE) && withTooltip(
                        <div className={classes.fab} >
                            <Fab color="primary" onClick={this.onAdd}>
                                <AddIcon />
                            </Fab>
                        </div>,
                        formatMessage(intl, "core", "roleManagement.createButton.tooltip")
                    )}
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user
        ? state.core.user.i_user.rights
        : [],
    language: !!state.core && !!state.core.user && !!state.core.user.i_user
        ? state.core.user.i_user.language
        : null,
    fetchingRoles: state.core.fetchingRoles,
    fetchedRoles: state.core.fetchedRoles,
    errorRoles: state.core.errorRoles,
    roles: state.core.roles,
    rolesPageInfo: state.core.rolesPageInfo,
    rolesTotalCount: state.core.rolesTotalCount,
    confirmed: state.core.confirmed,
    submittingMutation: state.core.submittingMutation,
    mutation: state.core.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchRoles, deleteRole, coreConfirm, journalize }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Roles)))));
