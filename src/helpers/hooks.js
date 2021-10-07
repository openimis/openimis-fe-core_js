import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { graphqlWithVariables, graphqlMutation } from "../actions";

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
  skip: true,
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

export const useGraphqlMutation = (operation, config = {}) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({ isLoading: false, error: null });

  async function mutate(input) {
    if (state.isLoading) {
      console.warn("A mutation is already in progress");
      return;
    }
    setState({ isLoading: true, error: null });
    try {
      const variables = {
        input,
      };
      const action = await dispatch(graphqlMutation(operation, variables, config.type, { operation, input }));
      setState({ isLoading: false, error: null });
      if (config.onSuccess) {
        return config.onSuccess(action.payload.data);
      } else {
        return action.payload.data;
      }
    } catch (err) {
      if (config.onError) {
        config.onError(err);
      }
      setState({
        isLoading: false,
        error: err,
      });
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    mutate,
  };
};
