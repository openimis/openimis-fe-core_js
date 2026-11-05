import { describe, expect, it } from "vitest";
import { createTheme } from "@mui/material/styles";

import { classicJournalLayout, popupJournalLayout } from "./journalLayouts";

// jsdom does no layout, so what is asserted is the constraint itself: a flex item keeps
// `min-width: auto` unless told otherwise and grows to its content, so a grid wider than
// the screen pushed the page out to its own width, where an overflow: hidden ancestor
// clipped it - no scrollbar, and the last columns out of reach (OP-3240).
const CONTENT_AREAS = ["& .layoutWrapper", "& .content", "& main"];

describe.each([
  ["classic (journal as a right sidebar)", classicJournalLayout],
  ["popup (journal as a drawer)", popupJournalLayout],
])("%s layout", (_, layout) => {
  const styles = layout(createTheme());

  it.each(CONTENT_AREAS)("lets %s shrink below the width of its content", (selector) => {
    expect(styles[selector]).toMatchObject({ minWidth: 0, maxWidth: "100%" });
  });
});
