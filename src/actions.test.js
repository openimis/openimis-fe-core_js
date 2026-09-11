import { describe, expect, it } from "vitest";
import { RSAA } from "redux-api-middleware";
import { applyMiddleware, createStore } from "redux";

import { graphqlMutation } from "./actions";
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

  it("does not journal a mutation the server rejected", async () => {
    const { store } = setup((query) =>
      query.includes("mutationLogs")
        ? { data: { mutationLogs: { totalCount: 0, pageInfo: {}, edges: [] } } }
        : { errors: [{ message: "boom" }] },
    );

    await store.dispatch(graphqlMutation(MUTATION, { input: { name: "Foo", clientMutationLabel: "Create Foo" } }));

    expect(store.getState().core.mutations).toEqual([]);
  });

  it("leaves the journal alone for mutations without a clientMutationId", async () => {
    const { store } = setup(() => ({ data: { tokenAuth: { refreshExpiresIn: 1 } } }));

    await store.dispatch(graphqlMutation("mutation { tokenAuth { refreshExpiresIn } }", {}));

    expect(store.getState().core.mutations).toEqual([]);
  });
});
