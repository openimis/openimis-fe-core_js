import { parseData, decodeId, pageInfo } from './helpers/api';

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
        default:
            return state;
    }
}

export default reducer;
