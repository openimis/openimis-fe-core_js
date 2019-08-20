import App from "./components/App";
import AutoSuggestion from "./components/AutoSuggestion";
import Contributions from "./components/Contributions";
import ControlledField from "./components/ControlledField";
import DatePicker from "./components/DatePicker";
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
import Picker from "./components/Picker";
import Table from "./components/Table";
import Searcher from "./components/Searcher";
import reducer from "./reducer";
import { baseApiUrl, apiHeaders, graphql } from './actions';
import { formatMessage, formatMessageWithValues, formatDateFromIso, formatAmount, chip, toISODate, fromISODate } from './helpers/i18n';
import { decodeId, formatQuery, formatPageQuery, formatPageQueryWithCount, parseData, pageInfo, formatServerError, formatGraphQLError } from './helpers/api';
import withHistory, { historyPush } from "./helpers/history";
import withModulesManager from './helpers/modules';

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: reducer }],
}

export const CoreModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}

export {
  baseApiUrl, apiHeaders, graphql, withHistory, historyPush,
  decodeId, toISODate, fromISODate,
  withModulesManager,
  formatQuery, formatPageQuery, formatPageQueryWithCount, parseData, pageInfo, formatServerError, formatGraphQLError,
  formatMessage, formatMessageWithValues, formatDateFromIso, formatAmount, chip,
  App, AutoSuggestion, Contributions, ControlledField, Error, FatalError, Picker,
  SelectInput, TextInput, AmountInput,
  Form, FieldLabel, FormattedMessage, NumberInput,
  MainMenuContribution, ProgressOrError, ProxyPage, PublishedComponent, Table, Searcher,
  DatePicker
};
