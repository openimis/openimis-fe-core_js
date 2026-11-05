import React from "react";
import { describe, expect, it } from "vitest";
import { act, makeStore, relayPage, renderWithProviders, screen } from "@openimis/fe-core/testing";

import JournalDrawer from "./JournalDrawer";
import { journalize } from "../actions";

const CLIENT_MUTATION_ID = "d3a1";
const LABEL = "Create pricelist Foo";

const mutationLogs = (nodes) => ({ payload: { data: { mutationLogs: relayPage(nodes) } } });

/** The journal only starts on its own if history has not been loaded yet; hand it an empty one. */
const readyStore = () => {
  const store = makeStore();
  store.dispatch({ type: "CORE_HISTORICAL_MUTATIONS_RESP", ...mutationLogs([]) });
  return store;
};

const completed = (status = 2) => ({
  type: "CORE_MUTATION_RESP",
  ...mutationLogs([{ status, clientMutationId: CLIENT_MUTATION_ID, clientMutationLabel: LABEL }]),
});

describe("JournalDrawer", () => {
  it("pops a success snackbar when a mutation it saw processing completes", () => {
    const store = readyStore();
    renderWithProviders(<JournalDrawer />, { store });

    act(() => {
      store.dispatch(journalize({ clientMutationId: CLIENT_MUTATION_ID, clientMutationLabel: LABEL }));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    act(() => {
      store.dispatch(completed());
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(LABEL);
    expect(alert.className).toMatch(/colorSuccess|standardSuccess|filledSuccess/);
  });

  it("marks the snackbar as an error when the mutation failed", () => {
    const store = readyStore();
    renderWithProviders(<JournalDrawer />, { store });

    act(() => {
      store.dispatch(journalize({ clientMutationId: CLIENT_MUTATION_ID, clientMutationLabel: LABEL }));
    });
    act(() => {
      store.dispatch(completed(1));
    });

    expect(screen.getByRole("alert").className).toMatch(/Error/);
  });

  // A mutation the backend ran inline is journalled with its final status and
  // never passes through 0; it gets the same notice as a queued one (OP-3179).
  it("announces a mutation that lands already final", () => {
    const store = readyStore();
    renderWithProviders(<JournalDrawer />, { store });

    act(() => {
      store.dispatch(completed());
    });

    expect(screen.getByRole("alert")).toHaveTextContent(LABEL);
  });

  it("stays quiet for finished mutations replayed by the history load after a reload", () => {
    const store = makeStore();
    store.dispatch({ type: "CORE_HISTORICAL_MUTATIONS_REQ" });
    renderWithProviders(<JournalDrawer />, { store });

    act(() => {
      store.dispatch({
        type: "CORE_HISTORICAL_MUTATIONS_RESP",
        ...mutationLogs([
          { id: btoa("MutationLogGQLType:1"), status: 2, clientMutationId: CLIENT_MUTATION_ID, clientMutationLabel: LABEL },
        ]),
      });
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
