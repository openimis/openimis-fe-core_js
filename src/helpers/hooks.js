import { useModulesManager } from "@openimis/fe-core";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  refreshAuthToken,
  login,
  logout,
  initialize,
  graphqlWithVariables,
  graphqlMutation,
} from "../actions";

export const useDebounceCb = (cb, duration = 0) => {
  const [payload, setPayload] = useState();
  const [enabled, setEnabled] = useState(false);
  const timeoutRef = useRef();
  useEffect(() => {
    if (enabled) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => cb(...payload), duration);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [payload]);

  return (...args) => {
    setEnabled(true);
    setPayload(args);
  };
};

// Ref: https://usehooks.com/usePrevious/
export const usePrevious = (value) => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};

const DEFAULT_CONFIG = {
  type: "GRAPHQL_QUERY",
  skip: false,
  keepStale: false,
};

export const useGraphqlQuery = (operation, variables, config = {}) => {
  config = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  const dispatch = useDispatch();
  const [queryState, setQueryState] = useState({ isLoading: !config.skip, data: null, error: null });
  const [isMounted, setMounted] = useState(false);
  const prevVariables = usePrevious(variables ?? {});
  const prevOperation = usePrevious(operation);

  async function fetchQuery() {
    try {
      setQueryState({ isLoading: true, data: config.keepStale ? queryState.data : null, error: null });
      const action = await dispatch(graphqlWithVariables(operation, variables, config.type, { operation, variables }));
      if (action.error) {
        setQueryState({ error: action.payload, isLoading: false, data: null });
      } else {
        setQueryState({ error: null, isLoading: false, data: action.payload.data });
      }
    } catch (error) {
      setQueryState({ error, isLoading: false, data: null });
    }
  }

  useEffect(() => {
    if (!isMounted) return;
    if (operation !== prevOperation || !_.isEqual(variables, prevVariables)) {
      fetchQuery();
    }
  }, [operation, variables]);

  useEffect(() => {
    if (!config.skip) {
      fetchQuery();
    }
    setMounted(true);
  }, []);
  return {
    ...queryState,
    refetch: fetchQuery,
  };
};

const DEFAULT_GRAPHQL_MUTATION_CONFIG = {
  wait: true,
};
export const useGraphqlMutation = (operation, config) => {
  config = { ...DEFAULT_GRAPHQL_MUTATION_CONFIG, ...config };
  const dispatch = useDispatch();
  const [state, setState] = useState({ isLoading: false, error: null });

  function mutate(input) {
    if (state.isLoading) {
      console.warn("A mutation is already in progress");
      return;
    }
    setState({ isLoading: true, error: null });
    return new Promise(async (resolve, reject) => {
      try {
        const variables = {
          input,
        };
        const result = await dispatch(
          graphqlMutation(operation, variables, config.type, { operation, input }, config.wait),
        );

        // Handle graphql errors
        const error = result?.error?.map((err) => err.detail).join("; ");

        if (error) {
          throw new Error(error);
        }

        setState({ isLoading: false, error: error });
        if (config.onSuccess) {
          resolve(config.onSuccess(result));
        } else {
          resolve(result);
        }
      } catch (err) {
        setState({
          isLoading: false,
          error: err,
        });
        if (config.onError) {
          reject(config.onError(err));
        } else {
          reject(err);
        }
      }
    });
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    mutate,
  };
};

export const useAuthentication = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.core.user);
  const isInitialized = useSelector((state) => state.core.isInitialized);
  const error = useSelector((state) => state.core.authError);
  const refresh = async () => {
    await dispatch(refreshAuthToken());
  };

  return {
    user,
    error,
    isAuthenticated: Boolean(user),
    isInitialized,
    initialize: () => dispatch(initialize()),
    login: (credentials) => dispatch(login(credentials)),
    refresh,
    logout: () => dispatch(logout()),
  };
};

export const useUserQuery = () => {
  const modulesManager = useModulesManager();
  const { data, isLoading } = useGraphqlQuery(`
    query useUserQuery {
      user {
        healthFacility ${modulesManager.getProjection("location.HealthFacilityPicker.projection")}
        id
        username
        rights
        email
        lastName
        otherNames
        phone
        iUser {
          id
          uuid
          language {
            code
            name
          }
        }
        claimAdmin {
          id
          code
          uuid
        }
        officer {
          id
          uuid
          code
          dob
          address
          location {
            id
            uuid
            code
            name
            parent {
              id
              uuid
              code
              name
            }
          }
        }
      }
    }
  `);
  return { user: data?.user, isLoading };
};

export const useBoolean = (defaultValue = false) => {
  const [bool, setBool] = useState(defaultValue);

  const toggle = useCallback(() => setBool(!bool), [bool]);
  const on = useCallback(() => setBool(true), []);
  const off = useCallback(() => setBool(false), []);

  return [bool, { toggle, on, off }];
};
