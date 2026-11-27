import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";

import { injectIntl } from "./i18n";

// react-intl 10 removed injectIntl; ~390 module components still use it, so
// fe-core provides it on top of useIntl().

const renderIntl = (ui) =>
  render(
    <IntlProvider locale="en" messages={{ greeting: "Hello {name}" }}>
      {ui}
    </IntlProvider>,
  );

describe("injectIntl", () => {
  it("passes the intl object as the intl prop, with the other props", () => {
    const Greeting = ({ intl, name }) => <span>{intl.formatMessage({ id: "greeting" }, { name })}</span>;
    const Wrapped = injectIntl(Greeting);
    renderIntl(<Wrapped name="Ada" />);
    expect(screen.getByText("Hello Ada")).toBeTruthy();
  });

  it("works for class components", () => {
    class Greeting extends React.Component {
      render() {
        return <span>{this.props.intl.locale}</span>;
      }
    }
    const Wrapped = injectIntl(Greeting);
    renderIntl(<Wrapped />);
    expect(screen.getByText("en")).toBeTruthy();
  });

  it("keeps the wrapped component and its statics reachable", () => {
    class Page extends React.Component {
      static contribution = "page";
      render() {
        return null;
      }
    }
    const Wrapped = injectIntl(Page);
    expect(Wrapped.WrappedComponent).toBe(Page);
    expect(Wrapped.contribution).toBe("page");
    expect(Wrapped.displayName).toBe("injectIntl(Page)");
  });
});
