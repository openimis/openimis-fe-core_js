import App from "./components/App";
import React from "react";
import messages_en from "./translations/en.json";
import KeepLegacyAlive from "./components/KeepLegacyAlive";
import AutoSuggestion from "./components/inputs/AutoSuggestion";
import Autocomplete from "./components/inputs/Autocomplete";
import Contributions from "./components/generics/Contributions";
import Block from "./components/generics/Block";
import ControlledField from "./components/generics/ControlledField";
import Error from "./components/generics/Error";
import FatalError from "./components/generics/FatalError";
import AlertForwarder from "./components/generics/AlertForwarder";
import FieldLabel from "./components/generics/FieldLabel";
import Form from "./components/generics/Form";
import FormPanel from "./components/generics/FormPanel";
import FormattedMessage from "./components/generics/FormattedMessage";
import PagedDataHandler from "./components/generics/PagedDataHandler";
import SelectInput from "./components/inputs/SelectInput";
import TextInput from "./components/inputs/TextInput";
import ValidatedTextInput from "./components/inputs/ValidatedTextInput";
import TextAreaInput from "./components/inputs/TextAreaInput";
import AmountInput from "./components/inputs/AmountInput";
import NumberInput from "./components/inputs/NumberInput";
import FakeInput from "./components/inputs/FakeInput";
import MainMenuContribution from "./components/generics/MainMenuContribution";
import ProgressOrError from "./components/generics/ProgressOrError";
import ProxyPage from "./components/generics/ProxyPage";
import PublishedComponent from "./components/generics/PublishedComponent";
import Table from "./components/generics/Table";
import SearcherExport from "./components/generics/SearcherExport";
import Searcher from "./components/generics/Searcher";
import SearcherPane from "./components/generics/SearcherPane";
import AdDatePicker from "./pickers/AdDatePicker";
import NeDatePicker from "./pickers/NeDatePicker";
import Picker from "./components/generics/Picker";
import ConstantBasedPicker from "./components/generics/ConstantBasedPicker";
import YearPicker from "./pickers/YearPicker";
import MonthPicker from "./pickers/MonthPicker";
import LanguagePicker from "./pickers/LanguagePicker";
import Helmet from "./helpers/Helmet";
import AccountBox from "@material-ui/icons/AccountBox";
import Roles from "./pages/Roles";
import Role from "./pages/Role";
import reducer from "./reducer";
import ErrorBoundary from "./helpers/ErrorBoundary";
import ConfirmDialog from "./components/dialogs/ConfirmDialog";
import SelectDialog from "./components/dialogs/SelectDialog";
import {
  baseApiUrl,
  apiHeaders,
  graphql,
  graphqlMutation,
  graphqlMutationLegacy,
  graphqlWithVariables,
  waitForMutation,
  journalize,
  coreAlert,
  coreConfirm,
  fetchMutation,
  prepareMutation,
  clearCurrentPaginationPage,
} from "./actions";
import {
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  toISODate,
  formatAmount,
  withTooltip,
  useTranslations,
} from "./helpers/i18n";
import {
  decodeId,
  encodeId,
  formatQuery,
  formatPageQuery,
  formatPageQueryWithCount,
  parseData,
  pageInfo,
  formatServerError,
  formatGraphQLError,
  formatMutation,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  openBlob,
  sort,
  formatSorter,
  formatGQLString,
  formatNodeQuery
} from "./helpers/api";
import {
  downloadExport
} from "./helpers/downloadExport"
import {
  useDebounceCb,
  usePrevious,
  useGraphqlQuery,
  useBoolean,
  useGraphqlMutation,
  useAuthentication,
  useUserQuery,
} from "./helpers/hooks";
import withHistory, {
  historyPush,
  useLocation,
  useHistory,
  useParams,
  useRouteMatch,
  Link,
  Redirect,
  NavLink,
} from "./helpers/history";
import withModulesManager, { useModulesManager } from "./helpers/modules";
import { formatJsonField } from "./helpers/jsonExt";
import { RIGHT_ROLE_SEARCH } from "./constants";
import { authMiddleware } from "./middlewares";
import RefreshAuthToken from "./components/RefreshAuthToken";
import UserActivityReport from "./reports/UserActivityReport";
const ROUTE_ROLES = "roles";
const ROUTE_ROLE = "roles/role";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: "core", reducer: reducer }],
  "reports": [
    {
      key: "user_activity",
      component: UserActivityReport,
      isValid: (values) => values.dateFrom && values.dateTo,
      getParams: (values) => {
        const params = {}
        if (values.user) {
          params.requested_user_id = decodeId(values.user.iUser.id);
        }
        if (values.action) {
          params.action = values.action;
        }
        if (values.entity) {
          params.entity = values.entity;
        }
        params.date_start = values.dateFrom;
        params.date_end = values.dateTo;
        return params;
      },
    },
  ],
  "middlewares": [authMiddleware],
  "refs": [
    { key: "core.JournalDrawer.pollInterval", ref: 2000 },
    { key: "core.KeepLegacyAlive.pollInterval", ref: 300000 },
    { key: "core.YearPicker", ref: YearPicker },
    { key: "core.MonthPicker", ref: MonthPicker },
    { key: "core.LanguagePicker", ref: LanguagePicker },
    { key: "core.route.role", ref: ROUTE_ROLE },
  ],
  "core.Boot": [KeepLegacyAlive, RefreshAuthToken],
  "core.Router": [
    { path: ROUTE_ROLES, component: Roles },
    { path: ROUTE_ROLE + "/:role_uuid?", component: Role },
  ],
  "admin.MainMenu": [
    {
      text: <FormattedMessage module="core" id="roleManagement.label" />,
      icon: <AccountBox />,
      route: "/" + ROUTE_ROLES,
      filter: (rights) => rights.includes(RIGHT_ROLE_SEARCH),
    },
  ],
};

export const CoreModule = (cfg) => {
  let def = { ...DEFAULT_CONFIG };
  let DatePicker = AdDatePicker;
  if (cfg.datePicker === "ne") {
    DatePicker = NeDatePicker;
  }
  def.refs.push({ key: "core.DatePicker", ref: DatePicker });
  return { ...def, ...cfg };
};

export function combine(...hocs) {
  return function (Component) {
    return hocs.reduceRight((acc, hoc) => hoc(acc), Component);
  };
}

export * from "./helpers/utils";

export {
  Helmet,
  baseApiUrl,
  apiHeaders,
  graphql,
  graphqlWithVariables,
  graphqlMutation,
  graphqlMutationLegacy,
  waitForMutation,
  journalize,
  fetchMutation,
  prepareMutation,
  downloadExport,
  coreAlert,
  coreConfirm,
  clearCurrentPaginationPage,
  openBlob,
  sort,
  formatSorter,
  withHistory,
  useLocation,
  useHistory,
  useParams,
  useRouteMatch,
  Link,
  Redirect,
  NavLink,
  historyPush,
  decodeId,
  encodeId,
  withModulesManager,
  useModulesManager,
  formatQuery,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatNodeQuery,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  parseData,
  pageInfo,
  formatServerError,
  formatGraphQLError,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  toISODate,
  formatAmount,
  formatGQLString,
  formatJsonField,
  withTooltip,
  App,
  Autocomplete,
  AutoSuggestion,
  Block,
  Contributions,
  ControlledField,
  Picker,
  Error,
  FatalError,
  AlertForwarder,
  SelectInput,
  TextInput,
  ValidatedTextInput,
  TextAreaInput,
  AmountInput,
  FakeInput,
  YearPicker,
  MonthPicker,
  LanguagePicker,
  PagedDataHandler,
  Form,
  FormPanel,
  FieldLabel,
  FormattedMessage,
  NumberInput,
  MainMenuContribution,
  ProgressOrError,
  ProxyPage,
  PublishedComponent,
  Table,
  SearcherExport,
  Searcher,
  SearcherPane,
  SelectDialog,
  ConstantBasedPicker,
  ErrorBoundary,
  useTranslations,
  useDebounceCb,
  usePrevious,
  useGraphqlQuery,
  useGraphqlMutation,
  useUserQuery,
  ConfirmDialog,
  useAuthentication,
  useBoolean,
};
