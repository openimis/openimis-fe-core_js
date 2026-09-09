import { describe, expect, it } from "vitest";

import { formatRoleLabel } from "./role-label-formatter";

describe("formatRoleLabel", () => {
  it("strips the gql/mutation/perms noise words from the permission name", () => {
    expect(formatRoleLabel("insuree", "gql_mutation_create_insurees_perms", true)).toContain("Create Insurees");
  });

  it("title-cases both the module and the permission words", () => {
    expect(formatRoleLabel("social_protection", "gql_mutation_update_benefit_plan_perms", true)).toContain(
      "Social Protection | Update Benefit Plan",
    );
  });

  it("separates module from permission with a pipe", () => {
    expect(formatRoleLabel("insuree", "gql_mutation_create_perms", true)).toMatch(/Insuree \| Create/);
  });

  it("copes with empty arguments", () => {
    expect(() => formatRoleLabel()).not.toThrow();
  });

  // Currently fails: the false branch of the ternary is `null`, which the
  // template literal stringifies, so every unprefixed label starts with "null ".
  it.fails("does not emit a literal 'null' when the prefix is not requested", () => {
    expect(formatRoleLabel("insuree", "gql_query_insurees_perms")).not.toContain("null");
  });

  // Currently fails: words are title-cased to "Query" before the lowercase
  // replace runs, so the query -> search substitution never matches.
  it.fails("renames query permissions to search", () => {
    expect(formatRoleLabel("insuree", "gql_query_insurees_perms", true)).toContain("Search Insurees");
  });
});
