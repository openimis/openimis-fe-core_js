import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apiMiddleware } from "redux-api-middleware";

import { ModulesManagerProvider } from "../helpers/modules";
import coreReducer from "../reducer";

// Not re-exported from src/index.jsx on purpose: that would pull
// @testing-library into the production bundle. Import via
// "@openimis/fe-core/testing".

export const mockModulesManager = (overrides = {}) => ({
  getConf: (module, key, defaultValue = null) => defaultValue,
  getContribs: () => [],
  getMenuEntries: () => [],
  getRoutes: () => ({}),
  getOpenIMISVersion: () => "test",
  getModulesVersions: () => [],
  hideField: () => false,
  getRef: () => null,
  getReport: () => null,
  getProjection: () => "",
  ...overrides,
});

export const makeStore = ({ preloadedState, reducers = {} } = {}) =>
  configureStore({
    reducer: combineReducers({ core: coreReducer, ...reducers }),
    preloadedState,
    // openIMIS puts non-serialisable values (Dates, File handles) in actions.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(apiMiddleware),
  });

export function renderWithProviders(ui, options = {}) {
  const {
    modulesManager = mockModulesManager(),
    store = makeStore(),
    messages = {},
    locale = "en",
    route = "/",
    theme = createTheme(),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* onError swallowed: tests supply only the messages they assert on */}
          <IntlProvider locale={locale} messages={messages} onError={() => {}}>
            <MemoryRouter initialEntries={[route]}>
              <ModulesManagerProvider value={modulesManager}>{children}</ModulesManagerProvider>
            </MemoryRouter>
          </IntlProvider>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  );

  return { store, modulesManager, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from "./fixtures";
export { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
