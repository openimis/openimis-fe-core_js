# openIMIS Frontend Core reference module

This repository holds the files of the openIMIS Frontend Core reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js) and provides

- openIMIS core mechanisms (authentication,...)
- openIMIS core components (Application iteself, MainMenu, JournalDrawer,...)
- openIMIS ModulesManager (loading, configuring and wiring all modules)
- many Generic components to be (re)used in other (business-focused) openimis components
- various helpers (building GraphQL queries,...)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-core_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-core_js/alerts/)

## Core Components

- `App`: application pages container (all openIMIS pages are loaded within that container)
- `AppWrapper`: wrapping main menu around each application page
- `JournalDrawer`: side bar in which mutation journal is displayed
- `AlertDialog`: pop up (modal) dialog to display an alert message (one 'ok' button)
- `ConfirmDialog`: pop up (modal) dialog to display a confirmation message (with 'cancel' / 'confirm' buttons)
- `SelectDialog`: pop up (modal) dialog to display a message and take an action between two options (yes/no, do/do not, continue/go back) - with editable (through the props) button labels, message content and dialog title, without using Redux store and actions
- `FataError`: page for non-recoverable backend access errors
- `Help`: main menu entry for Help (link to manual)
- `Logout`: main menu entry to logout
- `KeepLegacyAlive`: component to be registered in core.Boot contribution to keep legacy openIMIS session alive while interacting with new openIMIS pages

## Generic Components (to be reused along business-focused components)

- `MainMenuContribution`: generic class for main menu specific contributions (with route,...)
- `AutoSuggestion`: generic suggest-as-you-type (text)input field

  Note: cope with both pre-fetched (cached) suggestion list and query as you type (with debounce)

- `ConstantBasePicker`: fixed list select input field
- `Picker`: dialog-based (i.e. with search criteria) picker (handles pagination,...)
- `Contributions`: generic component to open business components for contributions
- `ControlledField`: field that is skipped based on module configuration
- `TextInput`,`NumberInput`, `AmountInput` & `SelectInput`: generic input components for the various data types
- `ValidatedTextInput`: generic input component which checks the uniqueness of entered data and gives the appropriate information about it
- `FieldLabel`: formatting a label in a form
- `FormattedMessage`: translated text (module/key)
- `ProgressOrError`: display progress during component's asynchronous calls... and hide or diaply error message when asynchronous call returns
- `Searcher`: generic searcher page (with criteria form and result table)
- `Form`: generic form. Manage dirty state, displays add/save button,...
- `Table`: generic table. Headers (with -sort-actions), rows,...

## Helpers

### redux actions helpers

- `journalize`: helper to trigger the `CORE_MUTATION_ADD` action (which register a mutation in the journal)
- `graphql`: helper to send the GraphQL queries (HTTP POST) and dispatch appropriate actions to redux
- `coreAlert`: helper to open the alert modal pop (cfr. AlertDialog)
- `coreConfirm`: helper to open the confirm modal pop (cfr. ConfirmDialog)

### api

- `formatQuery`: helper to format a simple GraphQL query (filters and projections)
- `formatPageQuery`: helper to format a GraphQL query (filters and projections), with pagination (edges and node)
- `formatPageQueryWithCount`: helper to format a GraphQL query, with pagination and totalCount
- `formatMutation`: helper to format a mutation (with clientMutationId and clientMutationLabel)
- `{de|en}codeId`: decoder|encoder for Graphene specific id mechanism
- `parseData`: navigate thru GraphQL standard edges|node structure and parse data from json to js object
- `pageInfo`: extract GraphQL standard pagination info (hasNextPage,...)
- `dispatchMutation{Req|Resp|Err}`: helper to submit a mutation and wait for response/error
- `formatServerError`: helper to format server error (error 500,...)
- `formatGraphQLError`: helper to format a graphql response returning (standard) error
- `openBlob`: helper to open a Blob (pdf,...) as a result of an asynchronous call

### i18n

- `formatMessage`: provide the translation of a module-prefixed key (fall back on openimis-fe_js/translations/ref.json)
- `formatMessageWithValues`: provide the translation of a module-prefixed key, for messages with vairable parts
- `formatAmount`: format an amount as a string
- `formatDateFromISO`: parse ISO date into (local) datetime

  Note: depends on the selected calendar (Gregorian vs. Nepali)

- `toISODate`: format local date to ISO format

  Note: depends on the selected calendar (Gregorian vs. Nepali)

### JSON handler

- `createFieldsBasedOnJSON`: Creates additional fields from a JSON string and returns an array of field objects.
- `renderInputComponent`: Renders the appropriate input component based on the field type and value.

### navigation

- `withHistory`: helper to inject history to any openIMIS component (allow navigation)
- `historyPush`: helper to push a new route to openIMIS navigation

### modules

- `withModulesManager`: helper to inject modulesManager to any openiMIS component

## Available Contribution Points

- `core.Boot`: register components that should be mounted at application start. It allows business modules to load cache at application startup, register to redux events (even when module not yet accessed),... The components registered for this contribution should not render any HTML (render should return null)
- `core.AppBar`: ability to add entries in the AppBar (known usage: insuree Enquiry component)
- `core.MainMenu`: ability to add main menu entries from modules (known usage: claim, insuree,...)
- `core.Router`: ability to register routes in client-side routing (known usage: claim, insuree,...)
- `core.UnauthenticatedRouter`: ability to register routes in client-side routing for pages that don't require user authentication
- `core.LoginPage`: ability to add components to the menu login page

## Contributions

- `core.Boot` - KeepLegacyAlive: contributing to own contribution point in order to register the component that pings the Legacy openIMIS application to prevent session timeout while in the new part.
- `core.Router`: registering `roles`, `roles/role` routes in openIMIS client-side router
- `admin.MainMenu`:

  **Roles Management** (`roleManagement.label` translation key)

## Published Components

- `core.DatePicker`, configured date picker (Gregorian vs. Nepali)
- `core.YearPicker`, pick a year within a range
- `core.MonthPicker`, contant-based month picker. Translation keys `month.null`, `month.1`,...
- `core.LanguagePicker`, pick from available languages

## Dispatched Redux Actions

- `CORE_ALERT{_CLEAR}`: display/close the AlertDialog modal pop up
- `CORE_CONFIRM{_CLEAR}`: display/close the ConfirmDialog modal pop up
- `CORE_USERS_CURRENT_USER_{REQ|RESP|ERR}`: retrieve authenticated info (language, rights,...)
- `CORE_MUTATION_{ADD|REQ|RESP|ERR}`: mutation lifecycle (request,...)
- `CORE_HISTORICAL_MUTATIONS_{REQ|RESP|ERR}`: retrieve mutations from previous sessions (init JournalDrawer)
- `CORE_ROLE_MUTATION_{REQ|ERR}`: sending a mutation on Role
- `CORE_ROLES_{REQ|RESP|ERR}`: retrieve Roles
- `CORE_MODULEPERMISSIONS_{REQ|RESP|ERR}`: retrieve permissions of all modules
- `CORE_LANGUAGES_{REQ|RESP|ERR}`: retrieve available languages and their codes
- `CORE_ROLE_{REQ|RESP|ERR}`: retrieve a single Role
- `CORE_ROLERIGHTS_{REQ|RESP|ERR}`: retrieve rights/permissions of a single Role
- `CORE_CREATE_ROLE_RESP`: receive a result of create Role mutation
- `CORE_UPDATE_ROLE_RESP`: receive a result of update Role mutation
- `CORE_DUPLICATE_ROLE_RESP`: receive a result of duplicate Role mutation
- `CORE_DELETE_ROLE_RESP`: receive a result of delete Role mutation

## Other Modules Listened Redux Actions

None

## Configurations Options

- `datePicker`: the concrete date picker to publish as `core.DatePicker` component ("ad"= Gregorian DatePicker, "ne"= Neplali calendar date picker )
- `useDynPermalinks`: use ?dyn=<Base64-URL> when opening in new tab (prevent sending client-side routes to server while) (Default: false)
- `core.JournalDrawer.pollInterval`: poll interval (in ms) to check for mutation status once submitted (Default: 2000)
- `core.KeepLegacyAlive.pollInterval`: poll interval (in ms) to send the ping to legacy openIMIS (to prevent session timeout). (Default: 300000 = 5')
- `journalDrawer.pageSize`: page size when loading (historical) mutations (Default: `5`)
- `AutoSuggestion.limitDisplay`: threshold to limit the number of items in the auto suggestions (adding 'more options...' message), default: 10
- `AmountInput.currencyPosition`: position of the currency for the AmountInput. Choices are `start` and `end` (default: `start`)
- `menuLeft`: position menu in the Drawer component on the left site of the application