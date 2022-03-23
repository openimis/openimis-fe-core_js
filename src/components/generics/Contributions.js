import React, { useMemo } from "react";
import { useModulesManager } from "../../helpers/modules";

function getComponents(modulesManager, key) {
  const contributions = modulesManager.getContribs(key);

  return contributions
    .map((contrib) => (typeof contrib === "string" ? modulesManager.getRef(contrib) : contrib))
    .filter(Boolean);
}

const Contributions = ({ children = null, contributionKey, reverse = false, ...delegated }) => {
  const modulesManager = useModulesManager();
  const components = useMemo(() => {
    const components = getComponents(modulesManager, contributionKey);
    if (reverse) {
      components.reverse();
    }
    return components;
  }, [contributionKey, reverse]);

  return (
    <>
      {children}
      {components.map((Comp, idx) => (
        <Comp key={`${contributionKey}_${idx}`} modulesManager={modulesManager} {...delegated} />
      ))}
    </>
  );
};

export default Contributions;
