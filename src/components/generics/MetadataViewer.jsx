import React from "react";
import { injectIntl } from "react-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TableContainer,
  Chip,
  Typography,
  Box,
} from "@mui/material";
import { formatMessage } from "../../helpers/i18n";

const formatKeyLabel = (key, intl, module = "core") => {
  if (!key) return "";
  if (intl) {
    const translated = formatMessage(intl, module, `metadata.${key}`);
    if (translated && !translated.startsWith("?") && translated !== `metadata.${key}`) {
      return translated;
    }
  }
  if (key === "uuid" || key === "id") return "UUID";
  if (key === "chf_id" || key === "chfId") return "CHF ID";
  if (key === "client_mutation_id" || key === "clientMutationId") return "Mutation ID";
  if (key === "client_mutation_label" || key === "clientMutationLabel") return "Action Label";
  if (key === "client_mutation_details" || key === "clientMutationDetails") return "Action Details";
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatValue = (val) => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

export function MetadataViewerComponent({ metadata, title = null, module = "core", intl, style = {} }) {
  if (!metadata) return null;

  let parsed = metadata;
  if (typeof metadata === "string") {
    try {
      parsed = JSON.parse(metadata);
    } catch (e) {
      return (
        <Typography variant="body2" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {metadata}
        </Typography>
      );
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    return <Typography variant="body2">{String(parsed)}</Typography>;
  }

  const entries = Object.entries(parsed).filter(
    ([k]) => k !== "mutation_extensions" && k !== "jsonExt" && k !== "json_ext"
  );

  if (entries.length === 0) return null;

  let resolvedTitle = null;
  if (title === true) {
    resolvedTitle = formatMessage(intl, "core", "metadataViewer.title") || "Details";
  } else if (typeof title === "string" && title.trim()) {
    const translatedTitle = formatMessage(intl, module, title);
    resolvedTitle = (translatedTitle && !translatedTitle.startsWith("?") && translatedTitle !== title)
      ? translatedTitle
      : title;
  }

  return (
    <Box style={{ marginTop: 10, width: "100%", ...style }}>
      {resolvedTitle && (
        <Typography variant="caption" style={{ fontWeight: 600, color: "#666", marginBottom: 4, display: "block" }}>
          {resolvedTitle}
        </Typography>
      )}
      <TableContainer
        component={Paper}
        variant="outlined"
        style={{
          maxHeight: 280,
          backgroundColor: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
        }}
      >
        <Table size="small">
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key} hover style={{ height: 32 }}>
                <TableCell
                  component="th"
                  scope="row"
                  style={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: "#475569",
                    width: "36%",
                    padding: "6px 12px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {formatKeyLabel(key, intl, module)}
                </TableCell>
                <TableCell
                  style={{
                    fontSize: "0.8rem",
                    color: "#0f172a",
                    padding: "6px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    wordBreak: "break-all",
                  }}
                >
                  {(key.toLowerCase().includes("uuid") || (key.toLowerCase().includes("id") && typeof value === "string" && value.length > 10)) ? (
                    <Chip
                      label={formatValue(value)}
                      size="small"
                      variant="outlined"
                      color="primary"
                      style={{ fontSize: "0.74rem", height: 22, fontWeight: 500 }}
                    />
                  ) : typeof value === "boolean" ? (
                    <Chip
                      label={value ? "Yes" : "No"}
                      size="small"
                      color={value ? "success" : "default"}
                      style={{ fontSize: "0.74rem", height: 20 }}
                    />
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
