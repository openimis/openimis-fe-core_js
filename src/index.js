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
import ValidatedTextAreaInput from "./components/inputs/ValidatedTextAreaInput";
import TextAreaInput from "./components/inputs/TextAreaInput";
import AmountInput from "./components/inputs/AmountInput";
import NumberInput from "./components/inputs/NumberInput";
import FakeInput from "./components/inputs/FakeInput";
import MainMenuContribution from "./components/generics/MainMenuContribution";
import ProgressOrError from "./components/generics/ProgressOrError";
import ProxyPage from "./components/generics/ProxyPage";
import PublishedComponent from "./components/generics/PublishedComponent";
import Table from "./components/generics/Table";
import TableService from "./components/generics/TableService";
import TableServiceReview from "./components/generics/TableServiceReview";
import SearcherExport from "./components/generics/SearcherExport";
import Searcher from "./components/generics/Searcher";
import SearcherPane from "./components/generics/SearcherPane";
import openIMISDatePicker from "./pickers/DatePicker";
import Picker from "./components/generics/Picker";
import ConstantBasedPicker from "./components/generics/ConstantBasedPicker";
import CustomFilterFieldStatusPicker from "./pickers/CustomFilterFieldStatusPicker";
import CustomFilterTypeStatusPicker from "./pickers/CustomFilterTypeStatusPicker";
import YearPicker from "./pickers/YearPicker";
import MonthPicker from "./pickers/MonthPicker";
import LanguagePicker from "./pickers/LanguagePicker";
import AuthorityPicker from "./pickers/AuthorityPicker";
import Helmet from "./helpers/Helmet";
import AccountBox from "@material-ui/icons/AccountBox";
import Roles from "./pages/Roles";
import Role from "./pages/Role";
import reducer from "./reducer";
import ErrorBoundary from "./helpers/ErrorBoundary";
import ConfirmDialog from "./components/dialogs/ConfirmDialog";
import SelectDialog from "./components/dialogs/SelectDialog";
import AdvancedFiltersDialog from "./components/dialogs/AdvancedFiltersDialog";
import WarningBox from "./components/generics/WarningBox";
import {
  baseApiUrl,
  apiHeaders,
  graphql,
  graphqlMutation,
  graphqlWithVariables,
  journalize,
  coreAlert,
  coreConfirm,
  clearConfirm,
  fetchMutation,
  prepareMutation,
  clearCurrentPaginationPage,
  fetchCustomFilter,
  fetchPasswordPolicy
} from "./actions";
import {
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  formatDateTimeFromISO,
  toISODate,
  toISODateTime,
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
import { useToast } from "./helpers/ToastContext";
import { validatePassword } from "./helpers/passwordValidator";
import { passwordGenerator } from "./helpers/passwordGenerator"
import { createFieldsBasedOnJSON, renderInputComponent } from "./helpers/json-handler-utils";
import withModulesManager, { useModulesManager } from "./helpers/modules";
import { formatJsonField } from "./helpers/jsonExt";
import { RIGHT_ROLE_SEARCH, CLEARED_STATE_FILTER, EXPORT_FILE_FORMATS } from "./constants";
import { authMiddleware } from "./middlewares";
import RefreshAuthToken from "./components/RefreshAuthToken";
import UserActivityReport from "./reports/UserActivityReport";
import RegistersStatusReport from "./reports/RegistersStatusReport";
import SearcherActionButton from "./components/generics/SearcherActionButton";
import InfoButton from "./components/generics/InfoButton";

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
    {
      key: "registers_status",
      component: RegistersStatusReport,
      isValid: (values) => true,
      getParams: (values) => {
        const params = {}
        if (values.region) {
          params.requested_region_id = decodeId(values.region.id);
        }
        if (values.district) {
          params.requested_district_id = decodeId(values.district.id);
        }
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
    { key: "core.AuthorityPicker", ref: AuthorityPicker },
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
  def.refs.push({ key: "core.DatePicker", ref: openIMISDatePicker });
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
  AdvancedFiltersDialog,
  fetchCustomFilter,
  apiHeaders,
  graphql,
  graphqlWithVariables,
  graphqlMutation,
  journalize,
  fetchMutation,
  fetchPasswordPolicy,
  prepareMutation,
  downloadExport,
  coreAlert,
  coreConfirm,
  clearConfirm,
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
  validatePassword,
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
  formatDateTimeFromISO,
  toISODate,
  toISODateTime,
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
  WarningBox,
  SelectInput,
  TextInput,
  ValidatedTextInput,
  ValidatedTextAreaInput,
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
  TableService,
  TableServiceReview,
  SearcherExport,
  Searcher,
  SearcherPane,
  SelectDialog,
  ConstantBasedPicker,
  CustomFilterFieldStatusPicker,
  CustomFilterTypeStatusPicker,
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
  CLEARED_STATE_FILTER,
  createFieldsBasedOnJSON,
  renderInputComponent,
  SearcherActionButton,
  passwordGenerator,
  EXPORT_FILE_FORMATS,
  useToast,
  InfoButton,
};
