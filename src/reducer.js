function reducer(
    state = {
        authenticating: false,
        user: null,
        fatalError: null,
        fetchingMutations: false,
        mutations: [],
    },
    action,
) {
    switch (action.type) {
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
        case 'CORE_MUTATION_ADD':
            var mutations = [...state.mutations];
            mutations.unshift(action.payload);
            return {
                ...state,
                mutations,
            }
        case 'CORE_MUTATIONS_REQ':
            return {
                ...state,
                fetchingMutations: true
            }
        case 'CORE_MUTATIONS_RESP':
            var mutations = [...state.mutations];
            var res = action.payload.data.coreMutations.filter(m => m.status !== 0);
            if (!!res.length) {
                res.forEach(r => {
                    for (const m of mutations) {
                        if (m.internalId === r.internalId) {
                            m.status = r.status;
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
        case 'CORE_MUTATIONS_ERR':
            return {
                ...state,
                fetchingMutations: false
            }
        default:
            return state;
    }
}

export default reducer;
