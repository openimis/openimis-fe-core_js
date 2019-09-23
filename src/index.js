import React from "react";
import App from "./components/App";
import AutoSuggestion from "./components/AutoSuggestion";
import Contributions from "./components/Contributions";
import ControlledField from "./components/ControlledField";
import Error from "./components/Error";
import FatalError from "./components/FatalError";
import FieldLabel from "./components/FieldLabel";
import Form from "./components/Form";
import FormattedMessage from "./components/FormattedMessage";
import SelectInput from "./components/SelectInput";
import TextInput from "./components/TextInput";
import AmountInput from "./components/AmountInput";
import NumberInput from "./components/NumberInput";
import MainMenuContribution from "./components/MainMenuContribution";
import ProgressOrError from "./components/ProgressOrError";
import ProxyPage from "./components/ProxyPage";
import PublishedComponent from "./components/PublishedComponent";
import Table from "./components/Table";
import Searcher from "./components/Searcher";
import AdDatePicker from "./pickers/AdDatePicker";
import NeDatePicker from "./pickers/NeDatePicker";
import Picker from "./pickers/Picker";
import ConstantBasedPicker from "./pickers/ConstantBasedPicker";
import YearPicker from "./pickers/YearPicker";
import MonthPicker from "./pickers/MonthPicker";
import reducer from "./reducer";
import { baseApiUrl, apiHeaders, graphql, journalize } from './actions';
import { formatMessage, formatMessageWithValues, formatDateFromISO, formatAmount, chip } from './helpers/i18n';
import {
  decodeId, encodeId, formatQuery, formatPageQuery, formatPageQueryWithCount,
  parseData, pageInfo, formatServerError, formatGraphQLError, formatMutation,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
} from './helpers/api';
import withHistory, { historyPush } from "./helpers/history";
import withModulesManager from './helpers/modules';

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: reducer }],
  "refs": [
    { key: "core.JournalDrawer.pollInterval", ref: 2000 },
  ],
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
  baseApiUrl, apiHeaders, graphql, journalize,
  withHistory, historyPush,
  decodeId, encodeId,
  withModulesManager,
  formatQuery, formatPageQuery, formatPageQueryWithCount, formatMutation,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  parseData, pageInfo, formatServerError, formatGraphQLError,
  formatMessage, formatMessageWithValues, formatDateFromISO, formatAmount, chip,
  App, AutoSuggestion, Contributions, ControlledField, Error, FatalError, Picker,
  SelectInput, TextInput, AmountInput, YearPicker, MonthPicker,
  Form, FieldLabel, FormattedMessage, NumberInput,
  MainMenuContribution, ProgressOrError, ProxyPage, PublishedComponent, Table, Searcher,
  ConstantBasedPicker
};
