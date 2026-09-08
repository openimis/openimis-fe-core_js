# Agents Guidelines for openIMIS Core Frontend

## Theming and Color Usage (Important for Consistency)

All form inputs (TextInput, SelectInput, DatePicker, Autocomplete, Picker, etc.) ultimately rely on MUI's `TextField` (or equivalent) for rendering labels and input text.

**Rule:** Prefer the color scheme provided by the MUI theme over component-local overrides.

- **Do not force label colors.** Remove or avoid rules like:
  ```js
  '& .label': {
    color: theme.palette.primary.main,
  }
  ```
  These cause labels (and sometimes related text) on datepickers, selects/dropdowns, and custom pickers to differ from standard input text or other fields' labels.

- Let MUI + the host application's theme control `InputLabel` and input text colors. Apps commonly customize via:
  - `theme.palette.text.primary` / `theme.palette.text.secondary`
  - `theme.components.MuiInputLabel.styleOverrides`
  - `theme.components.MuiOutlinedInput` / `MuiInput` etc.
  - `theme.typography`

- **Always derive colors from `theme`** (passed to `styled()` callbacks or `useTheme()`):
  - Input / value text: `theme.palette.text.primary`
  - Labels / secondary text: `theme.palette.text.secondary`
  - Errors: `theme.palette.error.main`
  - Primary actions: `theme.palette.primary.main`
  - Disabled / placeholders: `theme.palette.text.disabled`, `theme.palette.action.disabled`, `theme.palette.divider`

- **Main / secondary palette colors and UI surfaces**: `theme.palette.primary.main`, `theme.palette.secondary.main`, `theme.palette.primary.light`, etc. are the right source for brand accent colors, active states, call-to-action elements, and certain highlights.
  - However, for structural / container elements (page shells, paper cards, form sections, table headers/rows, menu drawers, headers, FABs, dialogs, journal items, etc.) **strongly prefer the dedicated theme extension objects** first:
    - `theme.paper` (`.paper`, `.header`, `.title`, `.item`, `.action`, `.paperHeader` ...)
    - `theme.page` (and `.locked` etc.)
    - `theme.menu` (`.drawer.*`, `.appBar.*`, `.variant`)
    - `theme.table` (`.header`, `.row`, `.highlightedRow`, `.title` ...)
    - `theme.fab`, `theme.dialog`, `theme.jrnlDrawer`, `theme.fakeInput`, etc.
  - Common safe pattern (allows full override while providing a fallback):
    ```js
    color: theme.paper?.header?.color || theme.palette.primary.main,
    backgroundColor: theme.paper?.header?.backgroundColor || theme.palette.primary.light,
    ...theme.paper?.header,
    ```
  - Direct `primary.main` / `secondary.main` usage is appropriate for interactive accents, but surfaces and layout colors should be overridable via the higher-level theme keys so consuming applications can define a complete, coherent color scheme.

- **Never use hardcoded hex/rgb colors** (except as last-resort fallbacks inside theme expressions like `?? theme.palette.background.default`). They break theming and dark mode support. Update any that remain.

- For custom non-MUI controls (e.g. `react-multi-date-picker` in secondary calendar mode, or `react-multi-date-picker`):
  - Explicitly apply `theme.palette.text.primary` (for values) and `theme.palette.text.secondary` (for labels) inside the `styled` wrapper.

- Disabled / read-only "visibility boost" styles must still pull from the theme (see examples in TextInput.jsx and DatePicker.jsx).

- FieldLabel uses `...theme.typography?.label ?? {}` — extend via theme if custom label typography/color is needed.

### Why this matters
Previously, several input wrappers overrode labels to `primary.main`. Direct use of `palette.primary.main` / `secondary.main` for headers, papers, and containers (without theme.* fallbacks) also led to inconsistency.

This created slight but noticeable color differences:
- Between regular TextInput labels and DatePicker / Autocomplete / Picker labels
- Between dropdown (SelectInput) labels (which did *not* override) and other inputs
- Between MUI-based fields and custom date pickers
- Between modules that used `theme.paper.header` (or similar) vs. those that hard-baked primary/secondary for the same surfaces

Removing per-component overrides + preferring dedicated theme sections (paper, menu, table, ...) + falling back to palette colors only when needed ensures that the host app's full color scheme (including its chosen primary/secondary values or entirely custom surfaces) is respected everywhere.

## General

- This is the `@openimis/fe-core` package. Changes here affect all openIMIS frontend modules.
- Use MUI v7+ components and `@mui/material/styles` `styled()`.
- Input variant (standard/outlined/filled) is configurable via modules manager: `Input.variant`.
- When adding new inputs or pickers, wrap with `styled()` using the theme callback and inherit MUI TextField where possible.
- Update this file when introducing new theming or styling conventions.
