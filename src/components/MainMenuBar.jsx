import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { injectIntl } from "react-intl";
import { useModulesManager } from "../helpers/modules";
import { ErrorBoundary } from "@openimis/fe-core";
import { useToast } from "../helpers/ToastContext";
import { menuEntryMatchesLocationPath, getMenuText, prepareMenuEntries, ensureArray } from "../helpers/utils";
import MainMenuContribution from "./generics/MainMenuContribution";
import GetIconComponent from "../helpers/icons";

function getMenus(modulesManager, key, rights, menuVariant, history, intl) {
  // Get backend overrides
  const backendMenuConfigs = modulesManager.getConf("fe-core", "menus", []);
  const routes = modulesManager.getRoutes();
  // get default entries
  const menuEntries = modulesManager.getMenuEntries();
  const unsortedMenuEntries = backendMenuConfigs.length > 0 ? backendMenuConfigs : menuEntries;
  // Default contributionKey to id for all configs (backend/module); override if specified
  unsortedMenuEntries.forEach((config) => {
    if (!config.contributionKey) {
      config.contributionKey = config.id; // Use id as key to pull submenus, e.g., "individual.MainMenu"
    }
    if (!config.entries && !config.submenus && !config.contributionKey) {
      console.warn(`Menu ${config.id} has no entries or submenus or valid contributionKey.`);
    }
    config.text = getMenuText(config.name || config.text, intl);
  });
  // Sort by position (default 99 if missing; stable for duplicates)
  const sortedMenuConfigs = unsortedMenuEntries.sort((a, b) => (a.position || 99) - (b.position || 99));
  const mainMenuVariant = "icon_text";
  // Detect which top-level menu should be auto-expanded in drawer (matches current route against leaves)
  const activeMenuId = findActiveMenuId(sortedMenuConfigs, routes);

  // Process each menu config into a MainMenuContribution component
  const menuComponents = sortedMenuConfigs
    .filter((m) => m.text !== undefined)
    .map((config) => {
      const rawEntries = config.entries || config.submenus || [];
      const filteredEntries = prepareMenuEntries(rights, intl, rawEntries, routes);

      // Skip empty menus
      if (!filteredEntries.length) return null;

      // Resolve icon
      const IconComponent = GetIconComponent(config.icon);

      return (
        <MainMenuContribution
          key={config.id}
          mainMenuVariant={mainMenuVariant}
          menuVariant={menuVariant}
          header={config.text}
          menuId={config.id}
          modulesManager={modulesManager}
          rights={rights}
          history={history}
          entries={filteredEntries}
          icon={IconComponent}
          isInitiallyOpen={menuVariant === "Drawer" && config.id === activeMenuId}
        />
      );
    })
    .filter(Boolean);

  return menuComponents;
}

const findActiveMenuId = (menuConfigs, routes = null) => {
  if (!Array.isArray(menuConfigs)) return null;
  for (const menuConfig of menuConfigs) {
    const rawLeaves = ensureArray(menuConfig.entries).concat(ensureArray(menuConfig.submenus));
    if (rawLeaves.some((leaf) => menuEntryMatchesLocationPath(leaf, routes))) {
      return menuConfig.id;
    }
  }
  return null;
};

const MainMenuBar = ({ children = null, contributionKey, reverse = false, menuVariant, intl, ...delegated }) => {
  const modulesManager = useModulesManager();
  const toast = useToast();
  const history = useHistory();
  const rights = useSelector((state) => state.core?.user?.i_user?.rights || []);
  const components = useMemo(() => {
    const comps = getMenus(modulesManager, contributionKey, rights, menuVariant, history, intl);
    if (reverse) {
      comps.reverse();
    }
    return comps;
  }, [contributionKey, reverse, rights, menuVariant, history, intl]);

  return (
    <>
      {children}
      {components.map((item, idx) => {
        // Already a rendered React element (from fe-core.menus configs)
        if (React.isValidElement(item)) {
          return React.cloneElement(item, {
            key: `${contributionKey}_${idx}`,
            menuVariant,
            ...delegated,
          });
        }
        // Component reference (from old-style core.MainMenu)
        const Comp = item;
        return <Comp key={`${contributionKey}_${idx}`} menuVariant={menuVariant} {...delegated} />;
      })}
    </>
  );
};

export default injectIntl(MainMenuBar);
