import { afterEach, describe, expect, it } from "vitest";
import { RSAA } from "redux-api-middleware";
import { applyMiddleware, createStore } from "redux";

import { graphqlMutation, initialize } from "./actions";
import { getLocalStorage } from "./helpers/useLocalStorage";
import reducer from "./reducer";

/** redux-thunk is an assembly dependency; the two lines it contributes are cheaper to inline. */
const thunk =
  ({ dispatch, getState }) =>
  (next) =>
  (action) =>
    typeof action === "function" ? action(dispatch, getState) : next(action);

/**
 * Stands in for redux-api-middleware: answers every RSAA with a canned GraphQL body, in the
 * request/success order the real one uses, and records the queries it was asked for.
 */
const apiMock = (bodyFor, queries) => () => (next) => (action) => {
  const rsaa = action[RSAA];
  if (!rsaa) return next(action);
  const { query, variables } = JSON.parse(rsaa.body);
  queries.push({ query, variables });
  const [req, resp] = rsaa.types;
  next({ type: req.type ?? req, meta: req.meta });
  const success = { type: resp.type ?? resp, payload: bodyFor(query, variables), meta: resp.meta };
  next(success);
  return Promise.resolve(success);
};

const MUTATION = `
  mutation ($input: CreateItemsPricelistMutationInput!) {
    createItemsPricelist(input: $input) { internalId clientMutationId }
  }
`;

/** The mutation log the backend returns once the mutation has succeeded. */
const mutationLog = (clientMutationId) => ({
  data: {
    mutationLogs: {
      totalCount: 1,
      pageInfo: {},
      edges: [
        {
          node: {
            id: "bXV0YXRpb246MQ==",
            status: 2,
            clientMutationId,
            clientMutationLabel: "Create pricelist Foo",
            requestDateTime: "2026-09-10T10:00:00",
          },
        },
      ],
    },
  },
});

/** fetchMutation inlines the id in the query; waitForMutation passes it as a variable. */
const askedFor = (query, variables) => variables?.clientMutationId ?? query.match(/clientMutationId: "([^"]+)"/)?.[1];

const setup = (bodyFor) => {
  const queries = [];
  const store = createStore(
    (state, action) => ({ core: reducer(state?.core, action) }),
    applyMiddleware(thunk, apiMock(bodyFor, queries)),
  );
  return { store, queries };
};

describe("graphqlMutation", () => {
  it("leaves a single journal entry, the pending one updated by the fetched log", async () => {
    const { store } = setup((query, variables) =>
      query.includes("mutationLogs")
        ? mutationLog(askedFor(query, variables))
        : { data: { createItemsPricelist: { internalId: "17" } } },
    );

    await store.dispatch(
      graphqlMutation(MUTATION, { input: { name: "Foo", clientMutationLabel: "Create pricelist Foo" } }),
    );

    // A single entry: the pending one, overwritten by the log fetched right after.
    const { mutations } = store.getState().core;
    expect(mutations).toHaveLength(1);
    expect(mutations[0].clientMutationLabel).toBe("Create pricelist Foo");
    expect(mutations[0].status).toBe(2);
  });

  it("records the pending entry before fetching the log, not after", async () => {
    const seen = [];
    const { store } = setup((query, variables) => {
      if (query.includes("mutationLogs")) {
        seen.push(store.getState().core.mutations.map((m) => m.status));
        return mutationLog(askedFor(query, variables));
      }
      return { data: { createItemsPricelist: { internalId: "17" } } };
    });

    await store.dispatch(
      graphqlMutation(MUTATION, { input: { name: "Foo", clientMutationLabel: "Create pricelist Foo" } }),
    );

    // The journal must have seen it processing, otherwise no completion snackbar is raised.
    expect(seen[0]).toEqual([0]);
  });

  it("journals a mutation the server rejected, as failed", async () => {
    const { store } = setup((query) =>
      query.includes("mutationLogs")
        ? { data: { mutationLogs: { totalCount: 0, pageInfo: {}, edges: [] } } }
        : { errors: [{ message: "boom" }] },
    );

    await store.dispatch(graphqlMutation(MUTATION, { input: { name: "Foo", clientMutationLabel: "Create Foo" } }));

    // The user asked for it, so it is in the journal - and it reads as failed rather
    // than sitting at "processing" for ever, since a refused mutation has no log to poll.
    const { mutations } = store.getState().core;
    expect(mutations).toHaveLength(1);
    expect(mutations[0].clientMutationLabel).toBe("Create Foo");
    expect(mutations[0].status).toBe(1);
    expect(mutations[0].error).toContain("boom");
  });

  it("keeps the label from the input when the response already carries the outcome", async () => {
    // What useGraphqlMutation sends: the label in the input, none in its config, and an
    // operation enriched with `success`, so the outcome is read off the response.
    const input = { name: "Foo", clientMutationLabel: "Create product Foo" };
    const { store } = setup(() => ({
      data: { createItemsPricelist: { internalId: "17", success: true, error: null } },
    }));

    await store.dispatch(
      graphqlMutation(MUTATION, { input }, "CORE_TRIGGER_MUTATION", {
        operation: MUTATION,
        input,
        clientMutationLabel: undefined,
      }),
    );

    const { mutations } = store.getState().core;
    expect(mutations).toHaveLength(1);
    expect(mutations[0].status).toBe(2);
    expect(mutations[0].clientMutationLabel).toBe("Create product Foo");
  });

  it("keeps a label given only through the params when the response carries the outcome", async () => {
    // The change-password page names its entry through the hook config: no label in the input.
    const { store } = setup(() => ({ data: { createItemsPricelist: { success: true, error: null } } }));

    await store.dispatch(
      graphqlMutation(MUTATION, { input: { name: "Foo" } }, "CORE_TRIGGER_MUTATION", {
        clientMutationLabel: "Change password",
      }),
    );

    const { mutations } = store.getState().core;
    expect(mutations).toHaveLength(1);
    expect(mutations[0].clientMutationLabel).toBe("Change password");
  });

  it("leaves the journal alone for mutations without a clientMutationId", async () => {
    const { store } = setup(() => ({ data: { tokenAuth: { refreshExpiresIn: 1 } } }));

    await store.dispatch(graphqlMutation("mutation { tokenAuth { refreshExpiresIn } }", {}));

    expect(store.getState().core.mutations).toEqual([]);
  });
});

describe("initialize", () => {
  /**
   * Answers the boot requests as a backend with a live session would: the current user over
   * REST, and a CSRF token from getCsrfToken. Records each request's endpoint, body and headers.
   */
  const bootMock = (requests) => () => (next) => (action) => {
    const rsaa = action[RSAA];
    if (!rsaa) return next(action);
    const query = rsaa.body ? JSON.parse(rsaa.body).query : null;
    requests.push({ endpoint: rsaa.endpoint, query, headers: rsaa.headers });
    const [req, resp] = rsaa.types;
    next({ type: req.type ?? req, meta: req.meta });
    const payload = query?.includes("getCsrfToken")
      ? { data: { getCsrfToken: { csrfToken: "session-token" } } }
      : { id: 1, i_user: { id: 1, rights: [] } };
    const success = { type: resp.type ?? resp, payload, meta: resp.meta };
    next(success);
    return Promise.resolve(success);
  };

  const boot = async () => {
    const requests = [];
    const store = createStore(
      (state, action) => ({ core: reducer(state?.core, action) }),
      applyMiddleware(thunk, bootMock(requests)),
    );
    await store.dispatch(initialize());
    return { store, requests };
  };

  afterEach(() => {
    window.localStorage.clear();
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });

  it("asks the server for a CSRF token when the session left no csrftoken cookie", async () => {
    // A Django admin login under CSRF_USE_SESSIONS: the session cookie authenticates the
    // user, but there is no csrftoken cookie to mirror. Without a token every query fails
    // with "CSRF token missing or incorrect".
    const { store, requests } = await boot();

    const csrfRequest = requests.find((r) => r.query?.includes("getCsrfToken"));
    expect(csrfRequest, "getCsrfToken was requested").toBeDefined();
    // The session authenticates it: there is no JWT to send.
    expect(csrfRequest.headers.Authorization).toBeUndefined();
    expect(getLocalStorage("csrfToken")).toBe("session-token");
    expect(store.getState().core.isInitialized).toBe(true);
  });

  it("mirrors the csrftoken cookie without asking the server", async () => {
    document.cookie = "csrftoken=cookie-token";

    const { requests } = await boot();

    expect(requests.some((r) => r.query?.includes("getCsrfToken"))).toBe(false);
    expect(getLocalStorage("csrfToken")).toBe("cookie-token");
  });
});
