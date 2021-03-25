import {
    parseData,
    decodeId,
    pageInfo,
    formatGraphQLError,
    formatServerError,
    dispatchMutationReq,
    dispatchMutationResp,
    dispatchMutationErr
} from "./helpers/api";

function reducer(
    state = {
        authenticating: false,
        user: null,
        fatalError: null,
        fetchingHistoricalMutations: false,
        fetchedHistoricalMutations: false,
        fetchingMutations: false,
        mutations: [],
        filtersCache: {},
        fetchingRoles: false,
        fetchedRoles: false,
        roles: [],
        rolesPageInfo: {},
        rolesTotalCount: 0,
        errorRoles: null,
        fetchingModulePermissions: false,
        fetchedModulePermissions: false,
        modulePermissions: [],
        errorModulePermissions: null,
        fetchingRole: false,
        fetchedRole: false,
        role: null,
        errorRole: null,
        fetchingRoleRights: false,
        fetchedRoleRights: false,
        roleRights: [],
        errorRoleRights: null,
    },
    action,
) {
    switch (action.type) {
        case 'CORE_ALERT':
            return {
                ...state,
                alert: action.payload,
            };
        case 'CORE_ALERT_CLEAR':
            var s = { ...state };
            delete (s.alert);
            return s;
        case 'CORE_CONFIRM':
            return {
                ...state,
                confirm: action.payload,
                confirmed: null,
            };
        case 'CORE_CONFIRM_CLEAR':
            var s = {
                ...state,
                confirmed: action.payload
            };
            delete (s.confirm);
            return s;
        case 'CORE_USERS_CURRENT_USER_REQ':
            return {
                ...state,
                authenticating: true,
            };
        case 'CORE_USERS_CURRENT_USER_RESP':
            return {
                ...state,
                authenticating: false,
                user: action.payload,
            };
        case 'CORE_USERS_CURRENT_USER_ERR':
            return {
                ...state,
                authenticating: false,
                error: {
                    code: action.payload.status,
                    message: action.payload.statusText,
                    detail: !!action.payload.response ? action.payload.response.detail : null,
                }
            };
        case 'CORE_CACHE_FILTER':
            var filtersCache = { ...state.filtersCache, ...action.payload }
            return {
                ...state,
                filtersCache,
            }
        case 'CORE_MUTATION_ADD':
            var mutations = [...state.mutations];
            mutations.unshift(action.payload);
            return {
                ...state,
                mutations,
            }
        case 'CORE_MUTATION_REQ':
            return {
                ...state,
                fetchingMutations: true
            }
        case 'CORE_MUTATION_RESP':
            var mutations = [...state.mutations];
            var res = parseData(action.payload.data.mutationLogs).filter(m => m.status !== 0);
            if (!!res.length) {
                res.forEach(r => {
                    for (const m of mutations) {
                        if (m.id === decodeId(r.id)) {
                            m.status = r.status;
                            m.error = r.error;
                            break;
                        }
                    }
                })
            }
            return {
                ...state,
                fetchingMutations: false,
                mutations,
            }
        case 'CORE_MUTATION_ERR':
            return {
                ...state,
                fetchingMutations: false
            }
        case 'CORE_HISTORICAL_MUTATIONS_REQ':
            return {
                ...state,
                fetchingHistoricalMutations: true
            }
        case 'CORE_HISTORICAL_MUTATIONS_RESP':
            return {
                ...state,
                fetchingHistoricalMutations: false,
                fetchedHistoricalMutations: true,
                mutations: parseData(action.payload.data.mutationLogs).map(m => { return { ...m, id: decodeId(m.id) } }),
                mutationsPageInfo: pageInfo(action.payload.data.mutationLogs),
            }
        case 'CORE_HISTORICAL_MUTATIONS_ERR':
            return {
                ...state,
                fetchingHistoricalMutations: false,
                fetchedHistoricalMutations: true,
            }
        case 'CORE_ROLES_REQ':
            return {
                ...state,
                fetchingRoles: true,
                fetchedRoles: false,
                roles: [],
                rolesPageInfo: {},
                rolesTotalCount: 0,
                errorRoles: null
            };
        case "CORE_ROLES_RESP":
            return {
                ...state,
                fetchingRoles: false,
                fetchedRoles: true,
                roles: parseData(action.payload.data.role),
                rolesPageInfo: pageInfo(action.payload.data.role),
                rolesTotalCount: !!action.payload.data.role ? action.payload.data.role.totalCount : null,
                errorRoles: formatGraphQLError(action.payload)
            };
        case "CORE_ROLES_ERR":
            return {
                ...state,
                fetchingRoles: false,
                errorRoles: formatServerError(action.payload)
            };
        case 'CORE_MODULEPERMISSIONS_REQ':
            return {
                ...state,
                fetchingModulePermissions: true,
                fetchedModulePermissions: false,
                modulePermissions: [],
                errorModulePermissions: null
            };
        case "CORE_MODULEPERMISSIONS_RESP":
            return {
                ...state,
                fetchingModulePermissions: false,
                fetchedModulePermissions: true,
                modulePermissions: !!action.payload.data.modulesPermissions
                    ? action.payload.data.modulesPermissions.modulePermsList
                    : [],
                errorModulePermissions: formatGraphQLError(action.payload)
            };
        case "CORE_MODULEPERMISSIONS_ERR":
            return {
                ...state,
                fetchingModulePermissions: false,
                errorModulePermissions: formatServerError(action.payload)
            };
        case "CORE_ROLE_REQ":
            return {
                ...state,
                fetchingRole: true,
                fetchedRole: false,
                role: null,
                errorRole: null
            };
        case "CORE_ROLE_RESP":
            return {
                ...state,
                fetchingRole: false,
                fetchedRole: true,
                role: parseData(action.payload.data.role).find(role => !!role),
                errorRole: formatGraphQLError(action.payload)
            };
        case "CORE_ROLE_ERR":
            return {
                ...state,
                fetchingRole: false,
                errorRole: formatServerError(action.payload)
            };
        case 'CORE_ROLERIGHTS_REQ':
            return {
                ...state,
                fetchingRoleRights: true,
                fetchedRoleRights: false,
                roleRights: [],
                errorRoleRights: null
            };
        case "CORE_ROLERIGHTS_RESP":
            return {
                ...state,
                fetchingRoleRights: false,
                fetchedRoleRights: true,
                roleRights: parseData(action.payload.data.roleRight),
                errorRoleRights: formatGraphQLError(action.payload)
            };
        case "CORE_ROLERIGHTS_ERR":
            return {
                ...state,
                fetchingRoleRights: false,
                errorRoleRights: formatServerError(action.payload)
            };
        case "CORE_ROLE_MUTATION_REQ":
            return dispatchMutationReq(state, action);
        case "CORE_ROLE_MUTATION_ERR":
            return dispatchMutationErr(state, action);
        case "CORE_CREATE_ROLE_RESP":
            return dispatchMutationResp(state, "createRole", action);
        case "CORE_UPDATE_ROLE_RESP":
            return dispatchMutationResp(state, "updateRole", action);
        case "CORE_DELETE_ROLE_RESP":
            return dispatchMutationResp(state, "deleteRole", action);
        default:
            return state;
    }
}

export default reducer;
