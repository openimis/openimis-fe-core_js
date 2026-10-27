import React from "react";
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { ApiError, RSAA } from "redux-api-middleware";
import { applyMiddleware, createStore } from "redux";

import { enrichMutationOperation, useGraphqlMutation } from "./hooks";
import reducer from "../reducer";

/** redux-thunk is an assembly dependency; the two lines it contributes are cheaper to inline. */
const thunk =
  ({ dispatch, getState }) =>
  (next) =>
  (action) =>
    typeof action === "function" ? action(dispatch, getState) : next(action);

/**
 * Stands in for redux-api-middleware. `answer` returns either a GraphQL body, answered with
 * the success type, or an ApiError, answered with the failure type the way the real one does
 * for a non-2xx response.
 */
const apiMock = (answer, queries) => () => (next) => (action) => {
  const rsaa = action[RSAA];
  if (!rsaa) return next(action);
  const { query, variables } = JSON.parse(rsaa.body);
  queries.push({ query, variables });
  const [req, resp, err] = rsaa.types;
  next({ type: req.type ?? req, meta: req.meta });
  const body = answer(query, variables);
  const result =
    body instanceof ApiError
      ? { type: err.type ?? err, payload: body, error: true, meta: err.meta }
      : { type: resp.type ?? resp, payload: body, meta: resp.meta };
  next(result);
  return Promise.resolve(result);
};

const setup = (answer) => {
  const queries = [];
  const store = createStore(
    (state, action) => ({ core: reducer(state?.core, action) }),
    applyMiddleware(thunk, apiMock(answer, queries)),
  );
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { store, queries, wrapper };
};

/** What graphene answers when an operation selects a field its payload type does not have. */
const unknownField = (field, type) =>
  new ApiError(400, "Bad Request", {
    errors: [{ message: `Cannot query field "${field}" on type "${type}".` }],
  });

// The password mutations extend graphene's ClientIDMutation, not OpenIMISMutation: their
// payload has clientMutationId, success and error, and nothing else.
const CHANGE_PASSWORD = `
    mutation changePassword ($input: ChangePasswordMutationInput!) {
      changePassword(input: $input) {
        clientMutationId
        success
        error
      }
    }
  `;

const CREATE_PRODUCT = `
    mutation ($input: CreateProductMutationInput!) {
      createProduct(input: $input) {
        internalId
        clientMutationId
      }
    }
  `;

describe("enrichMutationOperation", () => {
  it("leaves an operation that selects no internalId unchanged", () => {
    const operation =
      "mutation ($input: X) { changePassword(input: $input) { clientMutationId success error } }";

    expect(enrichMutationOperation(operation)).toBe(operation);
  });

  it("still enriches an operation that selects internalId", () => {
    const enriched = enrichMutationOperation(CREATE_PRODUCT);

    for (const field of ["internalId", "status", "success", "error", "message", "metadata"]) {
      expect(enriched, `${field} is selected`).toMatch(new RegExp(`\\b${field}\\b`));
    }
    expect(enriched.match(/\binternalId\b/g)).toHaveLength(1);
  });
});

describe("useGraphqlMutation", () => {
  it("sends a ClientIDMutation as written and resolves with its payload", async () => {
    const { queries, wrapper } = setup((query, variables) =>
      /\b(internalId|status|message|metadata)\b/.test(query)
        ? unknownField("internalId", "ChangePasswordMutationPayload")
        : { data: { changePassword: { clientMutationId: variables.input.clientMutationId, success: true, error: null } } },
    );
    const { result } = renderHook(() => useGraphqlMutation(CHANGE_PASSWORD, { wait: false }), { wrapper });

    let data;
    await act(async () => {
      data = await result.current.mutate({ oldPassword: "old", newPassword: "new" });
    });

    expect(queries[0].query).not.toMatch(/\binternalId\b/);
    expect(data?.changePassword?.success).toBe(true);
  });

  it("rejects when the server refuses a mutation that selects no internalId", async () => {
    const { wrapper } = setup(() => unknownField("noSuchField", "ChangePasswordMutationPayload"));
    const { result } = renderHook(() => useGraphqlMutation(CHANGE_PASSWORD, { wait: false }), { wrapper });

    let outcome;
    await act(async () => {
      outcome = await result.current.mutate({ oldPassword: "old", newPassword: "new" }).then(
        (value) => ({ resolved: value }),
        (error) => ({ rejected: error }),
      );
    });

    expect(outcome).not.toHaveProperty("resolved");
    expect(outcome.rejected).toBeInstanceOf(Error);
    expect(result.current.error).toBe(outcome.rejected);
  });

  it("still resolves a refused OpenIMISMutation, which its callers do not catch", async () => {
    // Payer, Product and Tools await mutate() without a catch and then close their dialog;
    // the journal already shows the refusal.
    const { wrapper } = setup(() => unknownField("noSuchField", "CreateProductMutationPayload"));
    const { result } = renderHook(() => useGraphqlMutation(CREATE_PRODUCT), { wrapper });

    let outcome;
    await act(async () => {
      outcome = await result.current.mutate({ name: "Foo" }).then(
        (value) => ({ resolved: value }),
        (error) => ({ rejected: error }),
      );
    });

    expect(outcome).toEqual({ resolved: undefined });
    expect(result.current.error).toBeNull();
  });
});
