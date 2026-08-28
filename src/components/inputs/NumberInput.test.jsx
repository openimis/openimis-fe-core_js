import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The package barrel imports itself; take the real helper from the module that defines it.
vi.mock("@openimis/fe-core", async () => {
  const modules = await vi.importActual("../../helpers/modules");
  return { withModulesManager: modules.default };
});

const { default: NumberInput } = await import("./NumberInput");
const { mockModulesManager, renderWithProviders, screen, userEvent } = await import("../../testing");

// An empty thousandSeparator renders the plain TextInput branch.
const plainModulesManager = mockModulesManager({
  getConf: (module, key, defaultValue) => (key === "thousandSeparator" ? "" : defaultValue),
});

const renderInput = (props = {}, options = {}) =>
  renderWithProviders(<NumberInput value={props.value ?? ""} onChange={() => {}} {...props} />, {
    modulesManager: plainModulesManager,
    ...options,
  });

const value = () => document.querySelector("input").value;

// TextInput leaks props onto the DOM, so React warns on every render.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("NumberInput", () => {
  describe("value formatting", () => {
    it("renders a plain integer", () => {
      renderInput({ value: 42 });

      expect(value()).toBe("42");
    });

    it("renders an empty string for an empty value", () => {
      renderInput({ value: "" });

      expect(value()).toBe("");
    });

    it("hides zero unless displayZero is set", () => {
      renderInput({ value: 0 });
      expect(value()).toBe("");
    });

    it("shows zero when displayZero is set", () => {
      renderInput({ value: 0, displayZero: true });

      expect(value()).toBe("0");
    });

    it("pads a decimal string to the configured number of decimals", () => {
      renderInput({ value: "1.5", numberOfDecimals: 3 });

      expect(value()).toBe("1.500");
    });

    it("drops decimals when they are disallowed", () => {
      renderInput({ value: "1.5", allowDecimals: false });

      expect(value()).toBe("1.5");
    });

    it("renders nothing for a non-numeric value", () => {
      renderInput({ value: "abc" });

      expect(value()).toBe("");
    });
  });

  describe("range validation", () => {
    const messages = {
      "core.validation.minValue": "Must be at least {min}",
      "core.validation.maxValue": "Must be at most {max}",
    };
    const isFlaggedInvalid = () => document.querySelector(".Mui-error") !== null;

    it("flags a value below the minimum", () => {
      renderInput({ value: 3, min: 5 }, { messages });

      expect(isFlaggedInvalid()).toBe(true);
    });

    it("flags a value above the maximum", () => {
      renderInput({ value: 30, max: 10 }, { messages });

      expect(isFlaggedInvalid()).toBe(true);
    });

    it("stays quiet inside the range", () => {
      renderInput({ value: 7, min: 5, max: 10 }, { messages });

      expect(isFlaggedInvalid()).toBe(false);
    });

    // Currently fails: the message is passed as `error`, which TextInput collapses
    // to Boolean(err); the user gets a red border and no reason.
    it.fails("tells the user why the value is rejected", () => {
      renderInput({ value: 3, min: 5 }, { messages });

      expect(screen.getByText("Must be at least 5")).toBeInTheDocument();
    });

    it("passes min and max down to the native input", () => {
      renderInput({ value: 7, min: 5, max: 10 });

      const el = document.querySelector("input");
      expect(el.getAttribute("min")).toBe("5");
      expect(el.getAttribute("max")).toBe("10");
    });
  });

  describe("interaction", () => {
    // Currently fails: the field is rendered as type="number", so the DOM
    // discards any non-numeric string formatInput produces.
    it.fails("shows the not-applicable text for an empty value until the field is touched", () => {
      renderInput({ value: "", displayNa: true }, { messages: { "core.NumberInput.notApplicable": "N/A" } });

      expect(value()).toBe("N/A");
    });

    it("renders the field as a number input", () => {
      renderInput({ value: 1 });

      expect(document.querySelector("input").type).toBe("number");
    });

    it("clears the value when an edited field is left empty", async () => {
      const onChange = vi.fn();
      renderInput({ value: "", onChange });

      await userEvent.click(document.querySelector("input"));
      await userEvent.tab();

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("does not clear a field the user never touched", () => {
      const onChange = vi.fn();
      renderInput({ value: "", onChange });

      document.querySelector("input").blur();

      expect(onChange).not.toHaveBeenCalled();
    });

    it("leaves a populated field alone on blur", async () => {
      const onChange = vi.fn();
      renderInput({ value: 42, onChange });

      await userEvent.click(document.querySelector("input"));
      await userEvent.tab();

      expect(onChange).not.toHaveBeenCalledWith(null);
    });

    it("reports typed input to the caller", async () => {
      const onChange = vi.fn();
      renderInput({ value: "", onChange });

      await userEvent.type(document.querySelector("input"), "7");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("module configuration", () => {
    it("groups thousands using the configured locale", () => {
      // Despite the name, the value is a BCP-47 locale, not a separator char.
      const german = mockModulesManager({
        getConf: (module, key, defaultValue) => (key === "thousandSeparator" ? "de" : defaultValue),
      });

      renderWithProviders(<NumberInput value={1234567} onChange={() => {}} />, { modulesManager: german });

      expect(document.querySelector("input").value).toBe("1.234.567");
    });

    it("reads the separator from the fe-core module config", () => {
      const getConf = vi.fn((module, key, defaultValue) => defaultValue);

      renderWithProviders(<NumberInput value={1} onChange={() => {}} />, {
        modulesManager: mockModulesManager({ getConf }),
      });

      expect(getConf).toHaveBeenCalledWith("fe-core", "thousandSeparator", "en");
    });
  });
});
