import React, { Component } from "react";
import {
    withModulesManager,
    withHistory,
    formatMessage,
    formatMessageWithValues,
    journalize,
    Form
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createRole } from "../actions";
import RoleHeadPanel from "../components/RoleHeadPanel";
import RoleRightsPanel from "../components/RoleRightsPanel";
import { RIGHT_ROLE_CREATE } from "../constants";

const styles = theme => ({
    page: theme.page
});

class Role extends Component {
    constructor(props) {
        super(props);
        this.state = {
            role: {
                isSystem: false,
                isBlocked: false,
                roleRights: []
            }
        }
    }

    componentDidMount() {
        document.title = formatMessageWithValues(
            this.props.intl,
            "core",
            "roleManagement.role.page.title",
            this.titleParams(this.state.role)
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        }
    }

    save = role => {
        const { intl, createRole } = this.props;
        createRole(
            role,
            formatMessageWithValues(
                intl,
                "core",
                "roleManagement.CreateRole.mutationLabel",
                this.titleParams(role)
            )
        );
    }

    back = () => this.props.history.goBack();

    isRequiredFieldsEmpty = () => !!this.state.role && !!this.state.role.name ? false : true;

    canSave = () => !this.isRequiredFieldsEmpty();

    onEditedChanged = role => this.setState({ role });

    titleParams = role => ({ label: !!role && !!role.name ? role.name : null });

    render() {
        const { intl, rights, classes } = this.props;
        return (
            rights.includes(RIGHT_ROLE_CREATE) && (
                <div className={classes.page}>
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
                            `roleManagement.saveButton.tooltip.${this.canSave() ? 'enabled' : 'disabled'}`
                        )}
                    />
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    submittingMutation: state.core.submittingMutation,
    mutation: state.core.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createRole, journalize }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Role))))));
