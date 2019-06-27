import App from "./components/App";
import Contributions from "./components/Contributions";
import MainMenuContribution from "./components/MainMenuContribution";
import Logout from "./components/Logout";
import Help from "./components/Help";
import ProxyPage from "./components/ProxyPage";
import auth from "./reducers/auth";
import formatMessage from './helpers/i18n';

const CoreModule = {
  "reducers" : [{key: 'core', reducer: auth}],
  "core.AppBar": [Help, Logout]
};

export { formatMessage, App, CoreModule, Contributions, MainMenuContribution, ProxyPage };