import React from "react";
import App from "./components/App";
import KeepLegacyAlive from "./components/KeepLegacyAlive";
import AutoSuggestion from "./components/inputs/AutoSuggestion";
import Contributions from "./components/generics/Contributions";
import ControlledField from "./components/generics/ControlledField";
import Error from "./components/generics/Error";
import FatalError from "./components/generics/FatalError";
import AlertForwarder from "./components/generics/AlertForwarder";
import FieldLabel from "./components/generics/FieldLabel";
import Form from "./components/generics/Form";
import FormPanel from "./components/generics/FormPanel";
import FormattedMessage from "./components/generics/FormattedMessage";
import SelectInput from "./components/inputs/SelectInput";
import TextInput from "./components/inputs/TextInput";
import TextAreaInput from "./components/inputs/TextAreaInput";
import AmountInput from "./components/inputs/AmountInput";
import NumberInput from "./components/inputs/NumberInput";
import FakeInput from "./components/inputs/FakeInput";
import MainMenuContribution from "./components/generics/MainMenuContribution";
import ProgressOrError from "./components/generics/ProgressOrError";
import ProxyPage from "./components/generics/ProxyPage";
import PublishedComponent from "./components/generics/PublishedComponent";
import Table from "./components/generics/Table";
import Searcher from "./components/generics/Searcher";
import SearcherPane from "./components/generics/SearcherPane";
import AdDatePicker from "./pickers/AdDatePicker";
import NeDatePicker from "./pickers/NeDatePicker";
import Picker from "./components/generics/Picker";
import ConstantBasedPicker from "./components/generics/ConstantBasedPicker";
import YearPicker from "./pickers/YearPicker";
import MonthPicker from "./pickers/MonthPicker";
import reducer from "./reducer";
import { baseApiUrl, apiHeaders, graphql, journalize, coreAlert, coreConfirm } from './actions';
import { formatMessage, formatMessageWithValues, formatDateFromISO, toISODate, formatAmount } from './helpers/i18n';
import {
  decodeId, encodeId, formatQuery, formatPageQuery, formatPageQueryWithCount,
  parseData, pageInfo, formatServerError, formatGraphQLError, formatMutation,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr, openBlob
} from './helpers/api';
import withHistory, { historyPush } from "./helpers/history";
import withModulesManager from './helpers/modules';

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: reducer }],
  "refs": [
    { key: "core.JournalDrawer.pollInterval", ref: 2000 },
    { key: "core.KeepLegacyAlive.pollInterval", ref: 300000 },
    { key: "core.YearPicker", ref: YearPicker },
    { key: "core.MonthPicker", ref: MonthPicker },
  ],
  "core.Boot": [KeepLegacyAlive],
}

export const CoreModule = (cfg) => {
  let def = { ...DEFAULT_CONFIG };
  let DatePicker = AdDatePicker;
  if (cfg.datePicker === "ne") {
    DatePicker = NeDatePicker;
  }
  def.refs.push(
    { key: "core.DatePicker", ref: DatePicker }
  )
  return { ...def, ...cfg };
}

export {
  baseApiUrl, apiHeaders, graphql, journalize, coreAlert, coreConfirm, openBlob,
  withHistory, historyPush,
  decodeId, encodeId,
  withModulesManager,
  formatQuery, formatPageQuery, formatPageQueryWithCount, formatMutation,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  parseData, pageInfo, formatServerError, formatGraphQLError,
  formatMessage, formatMessageWithValues, formatDateFromISO, toISODate, formatAmount,
  App, AutoSuggestion, Contributions, ControlledField, Picker,
  Error, FatalError, AlertForwarder,
  SelectInput, TextInput, TextAreaInput, AmountInput, FakeInput, YearPicker, MonthPicker,
  Form, FormPanel, FieldLabel, FormattedMessage, NumberInput,
  MainMenuContribution, ProgressOrError, ProxyPage, PublishedComponent, Table,
  Searcher, SearcherPane,
  ConstantBasedPicker
};
