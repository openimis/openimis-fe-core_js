import React from "react";
import { describe, expect, it, vi } from "vitest";
import { MenuItem } from "@mui/material";

// The filter pane and the export button reach the dialogs, which import the package
// barrel; neither is under test here.
vi.mock("./SearcherPane", () => ({ default: () => null }));
vi.mock("./SearcherExport", () => ({ default: () => null }));

const { default: Searcher } = await import("./Searcher");
const { act, makeStore, renderWithProviders } = await import("../../testing");

// Journal statuses, as in helpers/mutations.js.
const RECEIVED = 0;
const SUCCESS = 2;

// A row being deleted carries the id of the mutation deleting it.
const deleting = { uuid: "row-1", code: "HF1", clientMutationId: "mutation-1" };

const renderSearcher = () => {
  const store = makeStore();
  const fetch = vi.fn();
  renderWithProviders(
    <Searcher
      module="test"
      fetch={fetch}
      items={[deleting]}
      itemsPageInfo={{ totalCount: 1 }}
      fetchingItems={false}
      fetchedItems={true}
      headers={() => ["code"]}
      itemFormatters={() => [(i) => i.code]}
      rowIdentifier={(i) => i.uuid}
    />,
    { store },
  );
  fetch.mockClear();
  return { store, fetch };
};

const journal = (store, status) =>
  act(() => {
    store.dispatch({ type: "CORE_MUTATION_ADD", payload: { clientMutationId: "mutation-1", status } });
  });

describe("Searcher", () => {
  it("reads the page again when a row's mutation succeeds", () => {
    const { store, fetch } = renderSearcher();
    journal(store, RECEIVED);

    journal(store, SUCCESS);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // A mutation the backend ran inline is journalled with its final status (the module's
  // journalize() of the response): it never passes through RECEIVED.
  it("reads the page again when a row's mutation is journalled already finished", () => {
    const { store, fetch } = renderSearcher();

    journal(store, SUCCESS);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not read the page while a row's mutation is still running", () => {
    const { store, fetch } = renderSearcher();

    journal(store, RECEIVED);

    expect(fetch).not.toHaveBeenCalled();
  });
});

// Modules contribute searcher actions as MenuItems (an upload, an upload history).
// In button mode (selectWithCheckbox) they sit in the header row, not in a Menu, and
// MUI 9's MenuItem throws outside a Menu or MenuList.
describe("Searcher actions contributed as menu items", () => {
  const UploadItem = () => <MenuItem>Upload</MenuItem>;

  it("renders them in button mode", async () => {
    const { mockModulesManager, screen } = await import("../../testing");
    renderWithProviders(
      <Searcher
        module="test"
        fetch={vi.fn()}
        items={[]}
        itemsPageInfo={{ totalCount: 0 }}
        fetchingItems={false}
        fetchedItems={true}
        headers={() => ["code"]}
        itemFormatters={() => [(i) => i.code]}
        rowIdentifier={(i) => i.uuid}
        withSelection="multiple"
        selectWithCheckbox
        actionsContributionKey="test.actions"
      />,
      {
        modulesManager: mockModulesManager({
          getContribs: (key) => (key === "test.actions" ? [UploadItem] : []),
        }),
      },
    );

    expect(screen.getByRole("menuitem", { name: "Upload" })).toBeInTheDocument();
  });
});
