import { describe, expect, it } from "vitest";

import { RoleMembershipScope } from "../generated/prisma/client";
import {
  parseRoleMembershipScopeQuery,
  toApiRoleMembershipScope,
  toPrismaRoleMembershipScope,
} from "./roleMembershipScope";

describe("toPrismaRoleMembershipScope", () => {
  it("maps team to TEAM", () => {
    expect(toPrismaRoleMembershipScope("team")).toBe(RoleMembershipScope.TEAM);
  });

  it("maps organization to ORGANIZATION", () => {
    expect(toPrismaRoleMembershipScope("organization")).toBe(
      RoleMembershipScope.ORGANIZATION,
    );
  });
});

describe("toApiRoleMembershipScope", () => {
  it("maps TEAM to team", () => {
    expect(toApiRoleMembershipScope(RoleMembershipScope.TEAM)).toBe("team");
  });

  it("maps ORGANIZATION to organization", () => {
    expect(toApiRoleMembershipScope(RoleMembershipScope.ORGANIZATION)).toBe(
      "organization",
    );
  });
});

describe("parseRoleMembershipScopeQuery", () => {
  it("returns undefined for non-string values", () => {
    expect(parseRoleMembershipScopeQuery(42)).toBeUndefined();
    expect(parseRoleMembershipScopeQuery(null)).toBeUndefined();
  });

  it("parses team and organization case-insensitively", () => {
    expect(parseRoleMembershipScopeQuery("TEAM")).toBe("team");
    expect(parseRoleMembershipScopeQuery(" Organization ")).toBe("organization");
  });

  it("returns undefined for invalid values", () => {
    expect(parseRoleMembershipScopeQuery("global")).toBeUndefined();
    expect(parseRoleMembershipScopeQuery("")).toBeUndefined();
  });
});
