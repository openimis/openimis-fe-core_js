import React from "react";
import { Dialog, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// The gap MUI keeps around a dialog paper (2 x 32px margin).
const VIEWPORT_GAP = "64px";

/**
 * A MUI Dialog that stays usable on small screens (OP-3306).
 *
 * - The paper is never taller than the viewport. `maxPaperHeight` (px or any CSS length)
 *   is only a cap on big screens: the dialog gets `min(maxPaperHeight, 100% - 64px)`.
 * - The paper is a flex column with `scroll="paper"`, so `DialogContent` scrolls and
 *   `DialogTitle` / `DialogActions` stay visible. Put the actions in `DialogActions`.
 * - Below `fullScreenBelow` (a theme breakpoint, default `md`) it goes full screen.
 *
 * Every other prop is passed to MUI's Dialog. Prefer `maxWidth` ("sm" ... "xl") with
 * `fullWidth` over fixed pixel widths.
 */
function ResponsiveDialog({ fullScreenBelow = "md", maxPaperHeight, slotProps, children, ...props }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down(fullScreenBelow));
  const cap = typeof maxPaperHeight === "number" ? `${maxPaperHeight}px` : maxPaperHeight;
  const maxHeight = cap ? `min(${cap}, calc(100% - ${VIEWPORT_GAP}))` : `calc(100% - ${VIEWPORT_GAP})`;
  const paper = slotProps?.paper ?? {};
  const callerSx = Array.isArray(paper.sx) ? paper.sx : [paper.sx ?? {}];

  return (
    <Dialog
      scroll="paper"
      fullScreen={fullScreen}
      {...props}
      slotProps={{
        ...slotProps,
        paper: {
          ...paper,
          sx: [{ display: "flex", flexDirection: "column", ...(fullScreen ? {} : { maxHeight }) }, ...callerSx],
        },
      }}
    >
      {children}
    </Dialog>
  );
}

export default ResponsiveDialog;
