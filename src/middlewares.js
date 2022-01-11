import { authError } from "./actions";

export function authMiddleware(store) {
  return function wrapDispatch(next) {
    return function handleAction(action) {
      if (action.type !== "CORE_AUTH_ERR" && action.payload?.name === "ApiError" && action.payload.status === 401) {
        return store.dispatch(authError(action.payload));
      }
      return next(action);
    };
  };
}
