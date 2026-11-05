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

## Testing

Vitest runs from the **assembly** (`openimis-fe_js`), not from this package — see its `AGENTS.md` for the runner, the commands and the conventions shared by all modules. This package is picked up as a Vitest project only when the assembly's `openimis.json` (or `openimis-dev.json`) declares `@openimis/fe-core` with an `@file:` spec; a `node_modules` symlink alone is not enough.

Specific to this package:

- The shared test helpers live here, in `src/testing` — `renderWithProviders`, `makeStore`, `mockModulesManager`. Tests in this package import them relatively (`../../testing`); other modules use the `@openimis/fe-core/testing` subpath. Keep them out of `src/index.jsx`: re-exporting would pull `@testing-library` into the production bundle.
- Components here import their helpers relatively, so they need no mocking. A component that imports the `@openimis/fe-core` barrel self-imports the package under test — mock it with `vi.mock` and load the subject with top-level `await import()` (see `NumberInput.test.jsx`).

## Mutations, the journal and list feedback

### Journalling is central — do not re-implement it per module

`graphql()` and `graphqlWithVariables()` journal any response whose `meta`
carries a `clientMutationId`. Only `formatMutation` call sites put one there, so
a query that *filters* by a client mutation id (it goes in the GraphQL filter
string, not in `params`) is never mistaken for a mutation.

What not to write in new code:

- a `journalize(this.props.mutation)` call,
- a `componentDidUpdate` watching `prevProps.submittingMutation && !this.props.submittingMutation`.

Both are now redundant. They are still present in ~48 components and are left in
place deliberately: `CORE_MUTATION_ADD` is idempotent per `clientMutationId`, so
a module that still calls `journalize()` itself produces no duplicate entry.

### Every reducer needs `dispatchMutationDefault` in its `default:` branch

```js
default:
  return dispatchMutationDefault(state, action);
```

A mutation response with no `case` of its own used to leave `submittingMutation`
stuck at `true`, which silently stopped that module journalling **anything** for
the rest of the session. A forgotten `case` must cost the page-specific side
effect, never the module's mutation state.

When adding a mutation, still add its `*_RESP` case — the default is a safety
net, not a substitute. Note that reducers in this codebase use both `case "X":`
and `case 'X':`, so a sweep for unhandled responses must be quote-agnostic.

### A mutation response means *queued*, not *done*

`core.async_mutations` is on by default in `PROD`, so an `OpenIMISMutation` is
handed to Celery and the GraphQL response returns as soon as the `MutationLog`
row exists. Never do this:

```js
await this.props.deleteThing(...);
this.fetch(this.state.params);   // races the worker, reads stale rows
```

Key the refresh off the mutation reaching `SUCCESS` instead. `Searcher` does
this already, so a searcher normally needs no refetch of its own.

A mutation that runs inline is different: it answers with its own `success`
field, and `immediateMutationOutcome()` uses exactly that to tell the two
families apart. Such a mutation is journalled with its final status rather than
added as pending, because it has no `MutationLog` to poll and a pending entry
would be re-polled for ever.

### A confirmation answers the caller that asked it

`coreConfirm` takes the action with the question:

```js
this.props.coreConfirm(title, message, {
  onConfirm: () => this.props.deleteThing(...),
  onCancel: () => {},                 // optional
});
```

What **not** to write, in any new code:

- `this.setState({ confirmedAction }, confirm)` — parking the action in component state,
- a `componentDidUpdate` / `useEffect` watching `props.confirmed` to run it (the flag no longer exists).

`state.core.confirmed` was one global boolean with no record of who asked. Every
component watching it read an OK as the answer to *its* question, so a stored
action that was never cleared — a delete the user **cancelled**, say — stayed
armed, and the next confirmation accepted anywhere in the app ran it. That was not
hypothetical: it submitted a `deletePolicy` the user had declined, seven
milliseconds before the delete they did confirm (OP-3190).

The handlers are held in `actions.jsx` next to `coreConfirm`, not in the store:
a function is not serialisable state, and nothing else has any business reading
them. `clearConfirm` calls exactly the one that asked, after the dispatch that
closes the dialog.

The flag is gone (OP-3229): `CORE_CONFIRM_CLEAR` no longer stores the answer, so
`onConfirm` / `onCancel` is the only way it reaches its asker. A component that needs
to remember it confirmed something (to lock a form, say) keeps that in its own state.
The third argument still accepts a bare `intent` string for compatibility, but
nothing in fe-core reads it any more.

### Row lifecycle: the link is the `clientMutationId`

A module stamps the row it is changing (`thing.clientMutationId = mutation.clientMutationId`)
and the journal holds the status for that same id. That pair is the whole link —
nothing needs the row's uuid in `meta`. `Searcher` reads `state.core.mutations`,
keeps a pending row locked, and re-reads the page once its mutation reaches
`SUCCESS`, which is what makes a deleted row disappear.

Scope, deliberately: **update and delete only**, and **only for rows already
loaded**. Create has no row to mark, and whether a new record belongs on the
current filtered/sorted page is a page decision. Nothing is ever fetched merely
to materialise a row.

**This only works for a searcher whose rows carry that stamp**, which in practice
means one driven through Redux. A searcher built on `useGraphqlQuery` +
`useGraphqlMutation` never touches Redux rows, so it gets no greying and no
removal — build list screens on the Redux pattern.

Caveat worth knowing, and bigger than it first looked: the stamp is an in-place
mutation of a Redux-held object — a write into the store outside any reducer. Two
consequences. It works only because nothing in the `Searcher` -> `Table` chain
memoises, so adding a `React.memo` there would break row locking silently. And
`ImmutableStateInvariantMiddleware`, which runs in **development only**, throws on
it: the same code that passes on a deployed instance can blank the page locally.

So the pattern is on borrowed time — 31 sites across 10 modules carry it, and
OP-3193 tracks moving the link into the reducer (or a `clientMutationId -> row id`
map) so the entities are left alone. Prefer that shape in new code if it has
landed; do not add new in-place stamps.

### A user action must always be able to refetch

`useGraphqlQuery` dedupes on deep-equal variables, which otherwise turns a Search
on unedited filters - or a plain refresh - into no request at all. `Searcher`
passes a fetch token as the second argument of its `fetch` prop; a module driving
a `useGraphqlQuery` list feeds that to `config.refreshKey`. A Redux-driven module
dispatches on every call and can ignore it.

Never pass `skip: true` to a list query. It is consulted only on mount, so it
means "never load" permanently. It is right for a picker that should wait for the
user to type, and wrong for anything that should show rows when the page opens.

### Do not raise a toast for a mutation from a page

The journal announces every mutation centrally, including one that was already
finished when journalled. A page raising its own success toast is per-module
handling of something generic, and no mutation in the application should do it.
Navigation after success *is* page-specific and belongs in the page.

### Secrets never reach the journal

`helpers/secrets.js` masks before journalling. It is a deliberate port of
`openimis-be-core_py` `core/mutation_log_secrets.py` — same hint list, same mask,
same depth bound — so a field masked server-side is masked here too. **Keep the
two in sync.** Masking is on by default; `secretFields` on the mutation config
adds a name the hints would miss. This matters because `useGraphqlMutation`
passes the raw mutation input as `params`, which for the password mutations is
the plaintext password.

### One reader for a failed mutation's error

`mutationErrorText` turns every stored shape — a service error `{message, detail}`,
a list of them, or plain text from an exception — into readable text. Both the
polled `MutationLog` error and an inline mutation's own error go through it, so an
entry reads the same whichever side it came from. It answers `""` for a shape it
does not recognise, which is why the journal keeps a `JSON.stringify` fallback
behind it.

### Reading rights

Rights live at `state.core.user.i_user.rights`:

```js
rights: state.core?.user?.i_user?.rights ?? [],
```

`state.core.i_user` does not exist. A selector missing the `user` segment
silently yields `[]` for every user, including super users, so every
`rights.includes(...)` guard evaluates to `false` and the feature it protects
disappears with no error anywhere (OP-3175).

## General

- This is the `@openimis/fe-core` package. Changes here affect all openIMIS frontend modules.
- Use MUI v7+ components and `@mui/material/styles` `styled()`.
- Input variant (standard/outlined/filled) is configurable via modules manager: `Input.variant`.
- When adding new inputs or pickers, wrap with `styled()` using the theme callback and inherit MUI TextField where possible.
- An input's "no value" is `null`/`undefined`, never `""`. `SelectInput` JSON-encodes its value to match option values, so an empty string reaches MUI as the literal `""`, matches no option, and makes MUI log an out-of-range warning on *every* render — one per keystroke in the surrounding form.
- Update this file when introducing new theming or styling conventions, or new
  conventions around mutations, journalling and list feedback.
