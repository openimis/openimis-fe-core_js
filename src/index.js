import CoreApp from "./components/CoreApp";
import Contributions from "./components/Contributions";
import MainMenuContribution from "./components/MainMenuContribution";
import MainSearcher from "./components/MainSearcher";
import Logout from "./components/Logout";
import HomePage from "./components/HomePage";
import ProxyPage from "./components/ProxyPage";

const CoreModule = {
  "core.Router": [{ path: "home", component: HomePage }],
  "core.AppBar": [MainSearcher, Logout]
};

export { CoreModule, CoreApp, Contributions, MainMenuContribution, ProxyPage };