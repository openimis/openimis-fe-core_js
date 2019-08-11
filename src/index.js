import App from "./components/App";
import AutoSuggestion from "./components/AutoSuggestion";
import Contributions from "./components/Contributions";
import ControlledField from "./components/ControlledField";
import DatePicker from "./components/DatePicker";
import Error from "./components/Error";
import FatalError from "./components/FatalError";
import FieldLabel from "./components/FieldLabel";
import FormattedMessage from "./components/FormattedMessage";
import InputSelect from "./components/InputSelect";
import InputText from "./components/InputText";
import MainMenuContribution from "./components/MainMenuContribution";
import ProgressOrError from "./components/ProgressOrError";
import ProxyPage from "./components/ProxyPage";
import PublishedComponent from "./components/PublishedComponent";
import SmallTable from "./components/SmallTable";
import Searcher from "./components/Searcher";
import reducer from "./reducer";
import { baseApiUrl, apiHeaders, graphql } from './actions';
import { formatMessage, formatDateFromIso, formatAmount, chip } from './helpers/i18n';
import { decodeId, encodeId, formatQuery, formatPageQuery, parseData, formatServerError, formatGraphQLError } from './helpers/api';
import withModulesManager from './helpers/modules';

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: reducer }],
}

export const CoreModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}

export {
  baseApiUrl, apiHeaders, graphql, 
  decodeId, encodeId, formatQuery, formatPageQuery, parseData, formatServerError, formatGraphQLError, withModulesManager,
  formatMessage, formatDateFromIso, formatAmount, chip,
  App, AutoSuggestion, Contributions, ControlledField, Error, FatalError, 
  InputSelect, InputText,
  FieldLabel, FormattedMessage,
  MainMenuContribution, ProgressOrError, ProxyPage, PublishedComponent, SmallTable, Searcher,
  DatePicker
};
