import App from "./components/App";
import Contributions from "./components/Contributions";
import MainMenuContribution from "./components/MainMenuContribution";
import ProxyPage from "./components/ProxyPage";
import auth from "./reducers/auth";
import formatMessage from './helpers/i18n';

const CoreModule = {
  "reducers" : [{key: 'core', reducer: auth}],
};

export { formatMessage, App, CoreModule, Contributions, MainMenuContribution, ProxyPage };