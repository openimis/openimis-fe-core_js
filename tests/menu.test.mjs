import test from "node:test";
import assert from "node:assert/strict";

import { configuredMenuEntries, isMenuShown } from "../src/helpers/menu.js";

const MENUS = [
  {
    id: "ReportsMainMenu",
    submenus: [
      { position: 2, id: "reports.menu.weekly" },
      { position: 1, id: "reports.menu.monthly" },
    ],
  },
];
const ENTRIES = [
  { id: "reports.menu.monthly", text: "Monthly", filter: (rights) => rights.includes(900001) },
  { id: "reports.menu.weekly", text: "Weekly", filter: (rights) => rights.includes(900002) },
  { id: "other.menu", text: "Other" },
];
const noIcon = () => null;

test("a configured menu without any entry the user may open is not shown", () => {
  const entries = configuredMenuEntries(MENUS, ENTRIES, "ReportsMainMenu", [101001], noIcon);
  assert.deepEqual(entries, []);
  assert.equal(isMenuShown(entries), false);
});

test("a configured menu shows the permitted entries in configured order", () => {
  const entries = configuredMenuEntries(MENUS, ENTRIES, "ReportsMainMenu", [900001, 900002], noIcon);
  assert.deepEqual(entries.map((e) => e.id), ["reports.menu.monthly", "reports.menu.weekly"]);
  assert.equal(isMenuShown(entries), true);
});
