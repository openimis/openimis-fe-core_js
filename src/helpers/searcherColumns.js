// Columns contributed to a <Searcher> through its `columnsContributionKey`.
// Pure module (no imports) so it runs under `node --test`.
//
// A contribution is `{ header, formatter, align?, sort?, exportField?, exportLabel? }`:
// - `header` / `formatter` follow the searcher's own `headers` / `itemFormatters`;
// - `align` is the cell alignment ("left", "right", "center");
// - `sort` is a `sorts` entry (`[orderField, ascendingFirst]`);
// - `exportField` (with an optional `exportLabel`) adds the column to the export.

export const ACTION_COLUMN_HEADER = "emptyLabel";

// Number of trailing action columns (headers equal to "emptyLabel").
export const trailingActionColumns = (headers = []) => {
  let count = 0;
  while (count < headers.length && headers[headers.length - 1 - count] === ACTION_COLUMN_HEADER) {
    count += 1;
  }
  return count;
};

// Inserts `items` before the last `fromEnd` entries of `list`.
export const insertBeforeEnd = (list = [], fromEnd, items) => {
  const index = Math.max(0, list.length - fromEnd);
  return [...list.slice(0, index), ...items, ...list.slice(index)];
};

// Headers, formatters, header actions and alignments with the contributed
// columns placed before the trailing action columns. `sortAction(sort)` builds
// the header action of a contributed `sort`; a contribution without `sort` is
// not sortable. `aligns` stays null when neither the searcher nor any
// contribution sets an alignment.
export function mergeContributedColumns({ headers, formatters, headerActions, aligns }, contributions, sortAction) {
  if (!contributions?.length) {
    return { headers, formatters, headerActions, aligns };
  }
  const actionCount = trailingActionColumns(headers);
  const insertIndex = headers.length - actionCount;
  const contributedAligns = contributions.map((c) => c.align);
  let mergedAligns = aligns;
  if (aligns || contributedAligns.some(Boolean)) {
    const padded = Array.from({ length: headers.length }, (_, i) => (aligns ? aligns[i] : undefined));
    mergedAligns = [...padded.slice(0, insertIndex), ...contributedAligns, ...padded.slice(insertIndex)];
  }
  return {
    headers: insertBeforeEnd(headers, actionCount, contributions.map((c) => c.header)),
    formatters: insertBeforeEnd(formatters, actionCount, contributions.map((c) => c.formatter)),
    headerActions: insertBeforeEnd(
      headerActions,
      actionCount,
      contributions.map((c) => (c.sort ? sortAction(c.sort) : [null, () => null])),
    ),
    aligns: mergedAligns,
  };
}

// Export fields and column labels with the contributed `exportField`s appended.
export function mergeContributedExport(exportFields, exportFieldsColumns, contributions) {
  const exported = (contributions || []).filter((c) => !!c.exportField);
  if (!exported.length) {
    return { exportFields, exportFieldsColumns };
  }
  const columns = { ...(exportFieldsColumns || {}) };
  exported.forEach((c) => {
    if (c.exportLabel) columns[c.exportField] = c.exportLabel;
  });
  return {
    exportFields: [...(exportFields || ["id"]), ...exported.map((c) => c.exportField)],
    exportFieldsColumns: columns,
  };
}
