import {
  parseData,
  decodeId,
  pageInfo,
  formatGraphQLError,
  formatServerError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
} from "./helpers/api";
import _ from "lodash";

function reducer(
  state = {
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
    isInitialized: false,
    authError: null,
    paginationPage: 0,
    afterCursor: null,
    beforeCursor: null,
    module: null,
    fetchingCustomFilters: false,
    errorCustomFilters: null,
    fetchedCustomFilters: false,
    customFilters: [],
    isExportConfigDialogOpen: false,
    fetchingLanguages: false,
    fetchedLanguages: false,
    languages: [],
    errorLanguages: null,
  },
  action,
) {
  switch (action.type) {
    case "CORE_ALERT":
      return {
        ...state,
        alert: action.payload,
      };
    case "CORE_ALERT_CLEAR":
      var s = { ...state };
      delete s.alert;
      return s;
    case "CORE_CONFIRM":
      return {
        ...state,
        confirm: action.payload,
        confirmed: null,
      };
    case "CORE_CONFIRM_CLEAR":
      var s = {
        ...state,
        confirmed: action.payload,
      };
      delete s.confirm;
      return s;
    case "CORE_OPEN_EXPORT_CONFIG_DIALOG":
      return {
        ...state,
        isExportConfigDialogOpen: true,
      };
    case "CORE_CLOSE_EXPORT_CONFIG_DIALOG":
      return {
        ...state,
        isExportConfigDialogOpen: false,
      };
    case "CORE_USERS_CURRENT_USER_RESP":
      return {
        ...state,
        user: action.payload,
      };
    case "CORE_USERS_CURRENT_USER_ERR":
      return {
        ...state,
        error: {
          code: action.payload.status,
          message: action.payload.statusText,
          detail: !!action.payload.response ? action.payload.response.detail : null,
        },
      };
    case "PASSWORD_POLICY_FIELDS_REQ":
      return {
        ...state,
        fetchingPasswordPolicy: true,
        fetchedPasswordPolicy: false,
        passwordPolicy: null,
        errorPasswordPolicy: null,
      };
    case "PASSWORD_POLICY_FIELDS_RESP":
      return {
        ...state,
        fetchingPasswordPolicy: false,
        fetchedPasswordPolicy: true,
        passwordPolicy: action.payload.data.passwordPolicy,
        errorPasswordPolicy: formatGraphQLError(action.payload),
      };
    case "PASSWORD_POLICY_FIELDS_ERR":
      return {
        ...state,
        fetchingPasswordPolicy: false,
        errorPasswordPolicy: formatServerError(action.payload),
      };
    case "CORE_CACHE_FILTER":
      var filtersCache = { ...state.filtersCache, ...action.payload };
      return {
        ...state,
        filtersCache,
      };
    case "CORE_CACHE_FILTER_RESET":
      const key = action.payload;
      const filtersCacheCopy = { ...state.filtersCache };
      delete filtersCacheCopy[key];
      return {
        ...state,
        filtersCache: filtersCacheCopy,
      };

    case "CORE_MUTATION_ADD":
      return {
        ...state,
        mutations: [action.payload, ...state.mutations],
      };
    case "CORE_MUTATION_REQ":
      return {
        ...state,
        fetchingMutations: true,
      };
    case "CORE_MUTATION_RESP": {
      const mutations = parseData(action.payload.data.mutationLogs);
      return {
        ...state,
        fetchingMutations: false,
        mutations: _.unionBy(mutations, state.mutations, "clientMutationId"),
      };
    }
    case "CORE_MUTATION_ERR":
      return {
        ...state,
        fetchingMutations: false,
      };
    case "CORE_HISTORICAL_MUTATIONS_REQ":
      return {
        ...state,
        fetchingHistoricalMutations: true,
      };
    case "CORE_HISTORICAL_MUTATIONS_RESP":
      return {
        ...state,
        fetchingHistoricalMutations: false,
        fetchedHistoricalMutations: true,
        mutations: parseData(action.payload.data.mutationLogs).map((m) => {
          return { ...m, id: decodeId(m.id) };
        }),
        mutationsPageInfo: pageInfo(action.payload.data.mutationLogs),
      };
    case "CORE_HISTORICAL_MUTATIONS_ERR":
      return {
        ...state,
        fetchingHistoricalMutations: false,
        fetchedHistoricalMutations: true,
      };
    case "CORE_ROLES_REQ":
      return {
        ...state,
        fetchingRoles: true,
        fetchedRoles: false,
        roles: [],
        rolesPageInfo: {},
        rolesTotalCount: 0,
        errorRoles: null,
      };
    case "CORE_ROLES_RESP":
      return {
        ...state,
        fetchingRoles: false,
        fetchedRoles: true,
        roles: parseData(action.payload.data.role),
        rolesPageInfo: pageInfo(action.payload.data.role),
        rolesTotalCount: !!action.payload.data.role ? action.payload.data.role.totalCount : null,
        errorRoles: formatGraphQLError(action.payload),
      };
    case "CORE_ROLES_ERR":
      return {
        ...state,
        fetchingRoles: false,
        errorRoles: formatServerError(action.payload),
      };
    case "CORE_MODULEPERMISSIONS_REQ":
      return {
        ...state,
        fetchingModulePermissions: true,
        fetchedModulePermissions: false,
        modulePermissions: [],
        errorModulePermissions: null,
      };
    case "CORE_MODULEPERMISSIONS_RESP":
      return {
        ...state,
        fetchingModulePermissions: false,
        fetchedModulePermissions: true,
        modulePermissions: !!action.payload.data.modulesPermissions
          ? action.payload.data.modulesPermissions.modulePermsList
          : [],
        errorModulePermissions: formatGraphQLError(action.payload),
      };
    case "CORE_MODULEPERMISSIONS_ERR":
      return {
        ...state,
        fetchingModulePermissions: false,
        errorModulePermissions: formatServerError(action.payload),
      };
    case "CORE_LANGUAGES_REQ":
      return {
        ...state,
        fetchingLanguages: true,
        fetchedLanguages: false,
        languages: [],
        errorLanguages: null,
      };
    case "CORE_LANGUAGES_RESP":
      return {
        ...state,
        fetchingLanguages: false,
        fetchedLanguages: true,
        languages: !!action.payload.data.languages ? action.payload.data.languages : [],
        errorLanguages: formatGraphQLError(action.payload),
      };
    case "CORE_LANGUAGES_ERR":
      return {
        ...state,
        fetchingLanguages: false,
        errorLanguages: formatServerError(action.payload),
      };
    case "CORE_ROLE_REQ":
      return {
        ...state,
        fetchingRole: true,
        fetchedRole: false,
        role: null,
        errorRole: null,
      };
    case "CORE_ROLE_RESP":
      return {
        ...state,
        fetchingRole: false,
        fetchedRole: true,
        role: parseData(action.payload.data.role).find((role) => !!role),
        errorRole: formatGraphQLError(action.payload),
      };
    case "CORE_ROLE_ERR":
      return {
        ...state,
        fetchingRole: false,
        errorRole: formatServerError(action.payload),
      };
    case "CORE_ROLERIGHTS_REQ":
      return {
        ...state,
        fetchingRoleRights: true,
        fetchedRoleRights: false,
        roleRights: [],
        errorRoleRights: null,
      };
    case "CORE_ROLERIGHTS_RESP":
      return {
        ...state,
        fetchingRoleRights: false,
        fetchedRoleRights: true,
        roleRights: parseData(action.payload.data.roleRight),
        errorRoleRights: formatGraphQLError(action.payload),
      };
    case "CORE_ROLERIGHTS_ERR":
      return {
        ...state,
        fetchingRoleRights: false,
        errorRoleRights: formatServerError(action.payload),
      };
    case "CORE_ROLE_NAME_VALIDATION_FIELDS_REQ":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          roleName: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "CORE_ROLE_NAME_VALIDATION_FIELDS_RESP":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          roleName: {
            isValidating: false,
            isValid: action.payload?.data.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case "CORE_ROLE_NAME_VALIDATION_FIELDS_ERR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          roleName: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case "CORE_ROLE_NAME_VALIDATION_FIELDS_CLEAR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          roleName: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "CORE_ROLE_NAME_VALIDATION_FIELDS_SET_VALID":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          roleName: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case "FETCH_CUSTOM_FILTER_REQ":
      return {
        ...state,
        fetchingCustomFilters: true,
        fetchedCustomFilters: false,
        customFilters: [],
        errorCustomFilters: null,
      };
    case "FETCH_CUSTOM_FILTER_RESP":
      return {
        ...state,
        fetchingCustomFilters: false,
        fetchedCustomFilters: true,
        customFilters: !!action.payload.data.customFilters ? action.payload.data.customFilters.possibleFilters : [],
        errorCustomFilters: formatGraphQLError(action.payload),
      };
    case "FETCH_CUSTOM_FILTER_ERR":
      return {
        ...state,
        fetchingCustomFilters: false,
        errorCustomFilters: formatServerError(action.payload),
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

    // AUTH
    case "CORE_AUTH_LOGIN_RESP": {
      if (action.payload?.errors) {
        return {
          ...state,
          authError: formatGraphQLError(action.payload),
        };
      }
      return {
        ...state,
        authError: null,
      };
    }
    case "CORE_AUTH_ERR": {
      return {
        ...state,
        user: null,
        authError: formatServerError(action.payload),
      };
    }
    case "CORE_INITIALIZED":
      return {
        ...state,
        isInitialized: true,
      };
    case "CORE_AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        mutations: [],
        filtersCache: {},
        roles: [],
        rolesPageInfo: {},
        rolesTotalCount: 0,
        modulePermissions: [],
        role: null,
        roleRights: [],
      };
    case "CORE_PAGINATION_PAGE":
      return {
        ...state,
        savedPagination: {
          paginationPage: action.payload?.page,
          afterCursor: action.payload?.afterCursor,
          beforeCursor: action.payload?.beforeCursor,
          module: action.payload?.module,
        },
      };
    case "CORE_PAGINATION_PAGE_CLEAR":
      return {
        ...state,
        savedPagination: {
          paginationPage: 0,
          afterCursor: null,
          beforeCursor: null,
          module: null,
        },
      };
    case "CORE_CALENDAR_TYPE_TOGGLE":
      return {
        ...state,
        isSecondaryCalendarEnabled: action.payload.isSecondaryCalendarEnabled,
      };
    default:
      return state;
  }
}

export default reducer;
