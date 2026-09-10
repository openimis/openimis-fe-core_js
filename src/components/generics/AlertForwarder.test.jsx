import React from "react";
import { describe, expect, it } from "vitest";

import AlertForwarder from "./AlertForwarder";
import { makeStore, renderWithProviders } from "../../testing";

const messages = {
  "core.FatalError.title": "Something went wrong",
  "core.FatalError.message": "Please contact your administrator",
};

describe("AlertForwarder", () => {
  it("renders nothing", () => {
    const { container } = renderWithProviders(<AlertForwarder />, { messages });

    expect(container).toBeEmptyDOMElement();
  });

  it("does not raise an alert on first render", () => {
    const store = makeStore();

    renderWithProviders(<AlertForwarder alert="boom" />, { store, messages });

    expect(store.getState().core.alert).toBeUndefined();
  });

  it("dispatches a core alert once the alert prop appears", () => {
    const store = makeStore();
    const { rerender } = renderWithProviders(<AlertForwarder />, { store, messages });

    rerender(<AlertForwarder alert="Server exploded" />);

    expect(store.getState().core.alert).toEqual({
      title: "Something went wrong",
      message: "Please contact your administrator",
      detail: "Server exploded",
    });
  });

  it("does not re-dispatch when the alert is unchanged", () => {
    const store = makeStore();
    const { rerender } = renderWithProviders(<AlertForwarder />, { store, messages });

    rerender(<AlertForwarder alert="boom" />);
    store.dispatch({ type: "CORE_ALERT_CLEAR" });
    rerender(<AlertForwarder alert="boom" />);

    expect(store.getState().core.alert).toBeUndefined();
  });

  it("ignores the alert being cleared", () => {
    const store = makeStore();
    const { rerender } = renderWithProviders(<AlertForwarder alert="boom" />, { store, messages });

    rerender(<AlertForwarder alert={null} />);

    expect(store.getState().core.alert).toBeUndefined();
  });
});
