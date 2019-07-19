function auth(
    state = {
        authenticating: false,
        user: null,
        fatalError: null,
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
                fatalError: action.payload.status,
                fatalErrorMessage: action.payload.statusText,
                fatalErrorDetail: !!action.payload.response ? action.payload.response.detail : null,
            };
        default:
            return state;
    }
}

export default auth;
