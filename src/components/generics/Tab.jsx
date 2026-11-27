import React, { forwardRef, useContext } from "react";
import { Tab as MuiTab } from "@mui/material";
import { RovingTabIndexContext, useRovingTabIndexRoot } from "@mui/utils/useRovingTabIndex";

/*
 * MUI's Tab, also usable outside a <Tabs>.
 *
 * Pages lay out the tab labels several modules contribute themselves (a Grid of
 * Contributions) rather than as direct children of <Tabs>. MUI 9's Tab throws
 * without the roving tab index context <Tabs> provides; outside one, this Tab
 * provides its own, which is what a bare MUI 7 Tab amounted to.
 */
const StandaloneTab = forwardRef((props, ref) => {
  const roving = useRovingTabIndexRoot({ activeItemId: props.value });
  return (
    <RovingTabIndexContext.Provider value={roving}>
      <MuiTab ref={ref} {...props} />
    </RovingTabIndexContext.Provider>
  );
});

const Tab = forwardRef((props, ref) =>
  useContext(RovingTabIndexContext) ? <MuiTab ref={ref} {...props} /> : <StandaloneTab ref={ref} {...props} />,
);

export default Tab;
