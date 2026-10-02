import test from "node:test";
import assert from "node:assert/strict";

import {
  trailingActionColumns,
  mergeContributedColumns,
  mergeContributedExport,
} from "../src/helpers/searcherColumns.js";

const base = () => ({
  headers: ["code", "name", "emptyLabel", "emptyLabel"],
  formatters: ["fCode", "fName", "fEdit", "fDelete"],
  headerActions: [["sortCode"], ["sortName"], [null], [null]],
  aligns: false,
});
const sortAction = (s) => ["sorted", s];

test("counts the trailing action columns only", () => {
  assert.equal(trailingActionColumns(["a", "emptyLabel", "b", "emptyLabel", "emptyLabel"]), 2);
  assert.equal(trailingActionColumns(["a", "b"]), 0);
  assert.equal(trailingActionColumns([]), 0);
});

test("without contributions the columns are returned unchanged", () => {
  const columns = base();
  assert.deepEqual(mergeContributedColumns(columns, [], sortAction), columns);
});

test("contributed columns go before the trailing action columns", () => {
  const merged = mergeContributedColumns(base(), [{ header: "photo", formatter: "fPhoto" }], sortAction);
  assert.deepEqual(merged.headers, ["code", "name", "photo", "emptyLabel", "emptyLabel"]);
  assert.deepEqual(merged.formatters, ["fCode", "fName", "fPhoto", "fEdit", "fDelete"]);
  assert.equal(merged.headerActions[2][0], null);
  assert.equal(merged.headerActions[2][1](), null);
  assert.equal(merged.aligns, false);
});

test("a contribution with a sort gets a header action from sortAction", () => {
  const merged = mergeContributedColumns(base(), [{ header: "h", formatter: "f", sort: ["photo", true] }], sortAction);
  assert.deepEqual(merged.headerActions[2], ["sorted", ["photo", true]]);
});

test("alignments stay in step with the inserted columns", () => {
  const columns = { ...base(), aligns: [undefined, "right"] };
  const merged = mergeContributedColumns(columns, [{ header: "h", formatter: "f", align: "center" }], sortAction);
  assert.deepEqual(merged.aligns, [undefined, "right", "center", undefined, undefined]);
});

test("a contributed alignment builds the aligns array when the searcher has none", () => {
  const merged = mergeContributedColumns(base(), [{ header: "h", formatter: "f", align: "center" }], sortAction);
  assert.deepEqual(merged.aligns, [undefined, undefined, "center", undefined, undefined]);
});

test("searchers without header actions get one entry per contributed column", () => {
  const columns = { ...base(), headerActions: [] };
  const merged = mergeContributedColumns(columns, [{ header: "h", formatter: "f" }], sortAction);
  assert.equal(merged.headerActions.length, 1);
});

test("contributed export fields are appended with their labels", () => {
  const merged = mergeContributedExport(["id", "code"], { code: "Code" }, [
    { header: "h", formatter: "f" },
    { header: "p", formatter: "f", exportField: "photo_url", exportLabel: "Photo" },
  ]);
  assert.deepEqual(merged.exportFields, ["id", "code", "photo_url"]);
  assert.deepEqual(merged.exportFieldsColumns, { code: "Code", photo_url: "Photo" });
});

test("export props are untouched when no contribution is exported", () => {
  const columns = { code: "Code" };
  const merged = mergeContributedExport(undefined, columns, [{ header: "h", formatter: "f" }]);
  assert.equal(merged.exportFields, undefined);
  assert.equal(merged.exportFieldsColumns, columns);
});
