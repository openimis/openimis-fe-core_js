import { describe, expect, it } from "vitest";
import React, { useEffect } from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, RouterProvider, createMemoryRouter } from "react-router-dom";

import withHistory, {
  HistoryBlocker,
  Redirect,
  RouteProps,
  stripTrailingSlashes,
  useHistory,
  useLocation,
  useRouteMatch,
} from "./history";

// openIMIS modules were written against react-router 5: they receive history,
// location and match as props of their route component, and push through
// history.push / history.goBack. These tests pin that contract on top of
// react-router 7.

let probe;
const Probe = () => {
  probe = { history: useHistory(), location: useLocation() };
  return <span data-testid="path">{probe.location.pathname + probe.location.search}</span>;
};

const inMemoryRouter = (ui, initialEntries = ["/start"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe("useHistory (react-router 5 history on react-router 7)", () => {
  it("pushes a path with a query string", () => {
    inMemoryRouter(<Probe />);
    act(() => probe.history.push("/claims?x=1"));
    expect(screen.getByTestId("path").textContent).toBe("/claims?x=1");
  });

  it("pushes a location object and keeps its state", () => {
    inMemoryRouter(<Probe />);
    act(() => probe.history.push({ pathname: "/a", search: "?b=1", state: { from: "list" } }));
    expect(screen.getByTestId("path").textContent).toBe("/a?b=1");
    expect(probe.location.state).toEqual({ from: "list" });
  });

  it("passes the state given as second argument", () => {
    inMemoryRouter(<Probe />);
    act(() => probe.history.push("/a", { tab: 2 }));
    expect(probe.location.state).toEqual({ tab: 2 });
  });

  it("replaces, then goes back to the entry before", () => {
    inMemoryRouter(<Probe />, ["/one", "/two"]);
    act(() => probe.history.replace("/three"));
    expect(screen.getByTestId("path").textContent).toBe("/three");
    act(() => probe.history.goBack());
    expect(screen.getByTestId("path").textContent).toBe("/one");
  });

  // react-router 5 (history 4) resolved a relative path like a link in the page:
  // against the current path, replacing its last segment.
  it("resolves a relative path against the current location", () => {
    inMemoryRouter(<Probe />, ["/benefitPlans/benefitPlan/abc"]);
    act(() => probe.history.push("abc/project"));
    expect(screen.getByTestId("path").textContent).toBe("/benefitPlans/benefitPlan/abc/project");
  });

  it("resolves a relative location object too, keeping its query", () => {
    inMemoryRouter(<Probe />, ["/a/b/c"]);
    act(() => probe.history.replace({ pathname: "../d", search: "?x=1" }));
    expect(screen.getByTestId("path").textContent).toBe("/a/d?x=1");
  });

  it("keeps the same history object across navigations", () => {
    inMemoryRouter(<Probe />);
    const first = probe.history;
    act(() => probe.history.push("/elsewhere"));
    expect(probe.history).toBe(first);
  });

  it("exposes the current location on history.location", () => {
    inMemoryRouter(<Probe />);
    act(() => probe.history.push("/where?now=1"));
    expect(probe.history.location.pathname).toBe("/where");
    expect(probe.history.location.search).toBe("?now=1");
  });

  it("creates hrefs under the router basename", () => {
    render(
      <MemoryRouter basename="/front" initialEntries={["/front/start"]}>
        <Probe />
      </MemoryRouter>,
    );
    expect(probe.history.createHref({ pathname: "/claim/1", search: "?a=b" })).toBe("/front/claim/1?a=b");
  });
});

describe("withHistory", () => {
  it("hands the wrapped component a history prop", () => {
    let received;
    const Wrapped = withHistory((props) => {
      received = props;
      return null;
    });
    inMemoryRouter(<Wrapped other="kept" />);
    expect(typeof received.history.push).toBe("function");
    expect(received.other).toBe("kept");
  });
});

describe("useRouteMatch", () => {
  it("returns a react-router 5 match for a pattern", () => {
    let match;
    const C = () => {
      match = useRouteMatch("/claim/:claim_uuid");
      return null;
    };
    inMemoryRouter(<C />, ["/claim/abc/items"]);
    expect(match).toEqual({
      path: "/claim/:claim_uuid",
      url: "/claim/abc",
      params: { claim_uuid: "abc" },
      isExact: false,
    });
  });

  it("returns null when the pattern does not match", () => {
    let match = "unset";
    const C = () => {
      match = useRouteMatch("/policy/:id");
      return null;
    };
    inMemoryRouter(<C />, ["/claim/abc"]);
    expect(match).toBeNull();
  });
});

describe("RouteProps", () => {
  it("gives a route component history, location and match, as react-router 5 did", () => {
    let props;
    const Page = (p) => {
      props = p;
      return null;
    };
    render(
      <MemoryRouter initialEntries={["/individual/42?tab=1"]}>
        <Routes>
          <Route
            path="/individual/:individual_uuid?"
            element={<RouteProps path="/individual/:individual_uuid?" render={(p) => <Page {...p} />} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(props.match.params).toEqual({ individual_uuid: "42" });
    expect(props.match.path).toBe("/individual/:individual_uuid?");
    expect(props.match.url).toBe("/individual/42");
    expect(props.match.isExact).toBe(true);
    expect(props.location.search).toBe("?tab=1");
    expect(typeof props.history.push).toBe("function");
  });

  it("makes useRouteMatch() without a pattern return the route's match", () => {
    let match;
    const Page = () => {
      match = useRouteMatch();
      return null;
    };
    render(
      <MemoryRouter initialEntries={["/group/7"]}>
        <Routes>
          <Route
            path="/group/:group_uuid?"
            element={<RouteProps path="/group/:group_uuid?" render={() => <Page />} />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(match.params).toEqual({ group_uuid: "7" });
  });
});

describe("Redirect", () => {
  it("replaces the current entry", () => {
    render(
      <MemoryRouter initialEntries={["/old"]}>
        <Routes>
          <Route path="/old" element={<Redirect to="/home" />} />
          <Route path="*" element={<Probe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("path").textContent).toBe("/home");
    act(() => probe.history.goBack());
    expect(screen.getByTestId("path").textContent).toBe("/home");
  });
});

describe("history.block", () => {
  const renderDataRouter = (Page) => {
    const router = createMemoryRouter(
      [
        {
          path: "*",
          element: (
            <>
              <HistoryBlocker />
              <Page />
            </>
          ),
        },
      ],
      { initialEntries: ["/form"] },
    );
    render(<RouterProvider router={router} />);
    return router;
  };

  it("cancels a push while the blocker says no, and lets it through once unblocked", async () => {
    let unblock;
    let seen;
    const Page = () => {
      const history = useHistory();
      useEffect(() => {
        unblock = history.block((location) => {
          seen = location.pathname;
          return false;
        });
        return () => unblock();
      }, []);
      return <Probe />;
    };
    renderDataRouter(Page);
    await act(async () => probe.history.push("/other"));
    expect(screen.getByTestId("path").textContent).toBe("/form");
    expect(seen).toBe("/other");
    unblock();
    await act(async () => probe.history.push("/other"));
    expect(screen.getByTestId("path").textContent).toBe("/other");
  });

  it("lets navigation through when the blocker allows it", async () => {
    const Page = () => {
      const history = useHistory();
      useEffect(() => history.block(() => true), []);
      return <Probe />;
    };
    renderDataRouter(Page);
    await act(async () => probe.history.push("/next"));
    expect(screen.getByTestId("path").textContent).toBe("/next");
  });
});

describe("stripTrailingSlashes", () => {
  // The results the trailing-slash regex it replaces gave.
  it.each([
    ["", ""],
    ["/", ""],
    ["///", ""],
    ["/front", "/front"],
    ["/front/", "/front"],
    ["/front///", "/front"],
    ["/a//b/", "/a//b"],
    ["a", "a"],
  ])("turns %j into %j", (path, expected) => {
    expect(stripTrailingSlashes(path)).toBe(expected);
  });

  it("stays linear on a long run of slashes that is not at the end", () => {
    const path = `${"/".repeat(100000)}a`;
    expect(stripTrailingSlashes(path)).toBe(path);
  });
});
