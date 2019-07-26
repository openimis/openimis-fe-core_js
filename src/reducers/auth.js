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
                error: {
                    code: action.payload.status,
                    message: action.payload.statusText,
                    detail: !!action.payload.response ? action.payload.response.detail : null,
                }
            };
        default:
            return state;
    }
}

export default auth;
