export function formatServerError(payload) {
    return {
        code: payload.status,
        message: payload.statusText,
        detail: !!payload.response && payload.response.errors ?
            payload.response.errors.map((e) => e.message).join('; ')
            : null
    }
}

export function formatGraphQLError(payload) {
    return !payload.errors ? null : {
        code: "Data error",
        message: "Server returned data error status",
        detail: payload.errors.map((e) => e.message).join('; ')
    }
}
