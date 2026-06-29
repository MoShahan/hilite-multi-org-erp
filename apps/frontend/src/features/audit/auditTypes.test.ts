import { describe, expect, it } from "vitest";

import {
  formatAuditActionLabel,
  getAuditActionCategory,
} from "./auditTypes";

describe("formatAuditActionLabel", () => {
  it("returns the configured label for known actions", () => {
    expect(formatAuditActionLabel("AUTH_LOGIN_SUCCESS")).toBe("Login success");
    expect(formatAuditActionLabel("LEAD_CREATED")).toBe("Lead created");
    expect(formatAuditActionLabel("ORG_CREATED")).toBe("Organization created");
  });

  it("returns the raw action when no label is configured", () => {
    expect(formatAuditActionLabel("UNKNOWN_ACTION" as "AUTH_LOGIN_SUCCESS")).toBe(
      "UNKNOWN_ACTION",
    );
  });
});

describe("getAuditActionCategory", () => {
  it("categorizes auth actions", () => {
    expect(getAuditActionCategory("AUTH_LOGIN_SUCCESS")).toBe("auth");
    expect(getAuditActionCategory("AUTH_PASSWORD_CHANGED")).toBe("auth");
  });

  it("categorizes lead and activity actions", () => {
    expect(getAuditActionCategory("LEAD_CREATED")).toBe("lead");
    expect(getAuditActionCategory("LEAD_STATUS_CHANGED")).toBe("lead");
    expect(getAuditActionCategory("ACTIVITY_LOGGED")).toBe("lead");
  });

  it("categorizes admin actions", () => {
    expect(getAuditActionCategory("USER_CREATED")).toBe("admin");
    expect(getAuditActionCategory("ROLE_UPDATED")).toBe("admin");
    expect(getAuditActionCategory("ORG_MODULES_UPDATED")).toBe("admin");
  });
});
