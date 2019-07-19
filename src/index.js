import App from "./components/App";
import Contributions from "./components/Contributions";
import Error from "./components/Error";
import FatalError from "./components/FatalError";
import MainMenuContribution from "./components/MainMenuContribution";
import ProxyPage from "./components/ProxyPage";
import auth from "./reducers/auth";
import formatMessage from './helpers/i18n';
import { baseApiUrl, apiHeaders } from './actions/api'

const CoreModule = {
  "reducers" : [{key: 'core', reducer: auth}],
};

export { 
  formatMessage, baseApiUrl, apiHeaders,
  App, CoreModule, Contributions, Error, FatalError, MainMenuContribution, ProxyPage
};