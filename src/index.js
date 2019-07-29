import App from "./components/App";
import AutoSuggestion from "./components/AutoSuggestion";
import Contributions from "./components/Contributions";
import Error from "./components/Error";
import FatalError from "./components/FatalError";
import FieldLabel from "./components/FieldLabel";
import FormattedMessage from "./components/FormattedMessage";
import MainMenuContribution from "./components/MainMenuContribution";
import ProgressOrError from "./components/ProgressOrError";
import ProxyPage from "./components/ProxyPage";
import PublishedComponent from "./components/PublishedComponent";
import SmallTable from "./components/SmallTable";
import reducer from "./reducer";
import { baseApiUrl, apiHeaders, graphql } from './actions';
import formatMessage from './helpers/i18n';
import { formatServerError, formatGraphQLError } from './helpers/api';
import withModulesManager from './helpers/modules';

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: reducer }],
}

export const CoreModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...(cfg && cfg['fe-core'] || {}) };
}

export {
  baseApiUrl, apiHeaders, graphql, 
  formatMessage, formatServerError, formatGraphQLError, withModulesManager,
  App, AutoSuggestion, Contributions, Error, FatalError, FieldLabel, FormattedMessage,
  MainMenuContribution, ProgressOrError, ProxyPage, PublishedComponent, SmallTable
};
