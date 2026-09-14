import React from "react";
import { injectIntl } from "react-intl";
import { Table, TableBody, TableCell, TableRow, Paper, TableContainer, Chip, Typography, Box } from "@mui/material";

const HIDDEN_KEYS = ["mutation_extensions", "jsonExt", "json_ext"];

/** the first of the candidate ids actually declared in the catalogue, if any */
const translate = (intl, ...ids) => {
  const id = ids.find((candidate) => candidate && intl?.messages?.[candidate]);
  return id ? intl.formatMessage({ id }) : null;
};

const humanize = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatKeyLabel = (key, intl, module = "core") => {
  if (!key) return "";
  return translate(intl, `${module}.metadata.${key}`, `core.metadata.${key}`) ?? humanize(key);
};

const formatValue = (val) => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const isIdentifier = (key, value) =>
  key.toLowerCase().includes("uuid") ||
  (key.toLowerCase().includes("id") && typeof value === "string" && value.length > 10);

export function MetadataViewerComponent({ metadata, title = null, module = "core", intl, sx = {} }) {
  if (!metadata) return null;

  let parsed = metadata;
  if (typeof metadata === "string") {
    try {
      parsed = JSON.parse(metadata);
    } catch (e) {
      return (
        <Typography variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {metadata}
        </Typography>
      );
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    return <Typography variant="body2">{String(parsed)}</Typography>;
  }

  const entries = Object.entries(parsed).filter(([key]) => !HIDDEN_KEYS.includes(key));
  if (!entries.length) return null;

  let resolvedTitle = null;
  if (title === true) {
    resolvedTitle = translate(intl, "core.metadataViewer.title");
  } else if (typeof title === "string" && title.trim()) {
    resolvedTitle = translate(intl, `${module}.${title}`, title) ?? title;
  }

  return (
    <Box sx={{ mt: 1.25, width: "100%", ...sx }}>
      {resolvedTitle && (
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
          {resolvedTitle}
        </Typography>
      )}
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280, backgroundColor: "action.hover" }}>
        <Table size="small">
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key} hover>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 600, color: "text.secondary", width: "36%", verticalAlign: "top" }}
                >
                  {formatKeyLabel(key, intl, module)}
                </TableCell>
                <TableCell sx={{ wordBreak: "break-word" }}>
                  {isIdentifier(key, value) ? (
                    <Chip label={formatValue(value)} size="small" variant="outlined" color="primary" />
                  ) : typeof value === "boolean" ? (
                    <Chip label={formatValue(value)} size="small" color={value ? "success" : "default"} />
                  ) : (
                    formatValue(value)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export const MetadataViewer = injectIntl(MetadataViewerComponent);
export default MetadataViewer;
