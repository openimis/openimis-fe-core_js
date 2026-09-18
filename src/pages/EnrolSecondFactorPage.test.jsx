import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Route } from "react-router-dom";

vi.mock("../actions", async () => ({
  ...(await vi.importActual("../actions")),
  graphqlWithVariables: () => async () => ({ payload: { data: {} } }),
}));

import EnrolSecondFactorPage from "./EnrolSecondFactorPage";
import { mockModulesManager, renderWithProviders, screen } from "../testing";

const messages = { "core.SecondFactorEnrolment.username.label": "Username" };
const withFlag = (secondFactor) =>
  mockModulesManager({
    getConf: (module, key, defaultValue) => (key === "App.secondFactor" ? secondFactor : defaultValue),
  });
const loginProbe = <Route path="/login" render={() => <div>login page</div>} />;

describe("EnrolSecondFactorPage", () => {
  it("sends the visitor back to the login while the second factor is disabled (the default)", () => {
    renderWithProviders(
      <>
        <EnrolSecondFactorPage />
        {loginProbe}
      </>,
      { route: "/second_factor/enrol", modulesManager: withFlag(false), messages },
    );

    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders the enrolment with the username the login handed over", () => {
    renderWithProviders(
      <>
        <EnrolSecondFactorPage />
        {loginProbe}
      </>,
      {
        route: { pathname: "/second_factor/enrol", state: { username: "alice" } },
        modulesManager: withFlag(true),
        messages,
      },
    );

    expect(screen.getByLabelText(/username/i)).toHaveValue("alice");
    expect(screen.queryByText("login page")).toBeNull();
  });
});
