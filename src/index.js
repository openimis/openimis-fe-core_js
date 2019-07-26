import App from "./components/App";
import Contributions from "./components/Contributions";
import Error from "./components/Error";
import FatalError from "./components/FatalError";
import FieldLabel from "./components/FieldLabel";
import FormattedMessage from "./components/FormattedMessage";
import MainMenuContribution from "./components/MainMenuContribution";
import ProxyPage from "./components/ProxyPage";
import SmallTable from "./components/SmallTable";
import auth from "./reducers/auth";
import formatMessage from './helpers/i18n';
import { formatServerError, formatGraphQLError } from './helpers/api'
import { baseApiUrl, apiHeaders } from './actions/api'

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'core', reducer: auth }],
}

export const CoreModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...(cfg && cfg['fe-core'] || {}) };
}

export {
  formatMessage, formatServerError, formatGraphQLError, baseApiUrl, apiHeaders,
  App, Contributions, Error, FatalError, MainMenuContribution, ProxyPage,
  FieldLabel, FormattedMessage, SmallTable
};
