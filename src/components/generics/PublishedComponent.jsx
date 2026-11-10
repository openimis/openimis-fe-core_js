import React from "react";
import withModulesManager from "../../helpers/modules";
import { renderPublished, useOverrideScope } from "../../helpers/overrides";

// Renders the component published under `pubRef`, or the replacement a
// `core.ComponentOverrides` entry declares for that key.
const PublishedComponent = (props) => {
  // id kept for backward (< 1.2) compatibility,
  // but prefer using pubRef to prevent any conflict with React default id property
  const { modulesManager, id, pubRef, ...others } = props;
  const scope = useOverrideScope();
  return renderPublished(modulesManager, id || pubRef, scope, others);
};

export { PublishedComponent };
export default withModulesManager(PublishedComponent);
