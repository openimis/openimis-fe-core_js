import React, { Component } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    Searcher,
    formatDateFromISO,
    TextInput
} from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchRoles } from "../actions";
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    CONTAINS_LOOKUP,
    LANGUAGE_EN
} from "../constants";

const styles = theme => ({
    page: theme.page,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
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
    componentDidMount() {
        document.title = formatMessage(this.props.intl, "core", "roleManagement.label");
    }

    fetch = params => this.props.fetchRoles(params);

    headers = () => [
        "roleManagement.roleName",
        "roleManagement.isSystem",
        "roleManagement.isBlocked",
        "roleManagement.dateValidFrom",
        "roleManagement.dateValidTo"
    ];

    itemFormatters = () => {
        const { intl, modulesManager, language } = this.props;
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
        return result;
    }

    sorts = () => [
        ['name', true],
        ['isSystem', true],
        ['isBlocked', true],
        ['validityFrom', true],
        ['validityTo', true]
    ];

    render() {
        const {
            intl,
            classes,
            fetchingRoles,
            fetchedRoles,
            errorRoles,
            roles,
            rolesPageInfo,
            rolesTotalCount
        } = this.props;
        return (
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
                    tableTitle={formatMessageWithValues(intl, "core", "roleManagement.searcher.results.title", { rolesTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy={DEFAULT_ORDER_BY}
                />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    fetchingRoles: state.core.fetchingRoles,
    fetchedRoles: state.core.fetchedRoles,
    errorRoles: state.core.errorRoles,
    roles: state.core.roles,
    rolesPageInfo: state.core.rolesPageInfo,
    rolesTotalCount: state.core.rolesTotalCount,
    language: !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.language : null
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchRoles }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Roles)))));
