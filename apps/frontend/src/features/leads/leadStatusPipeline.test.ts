import { describe, expect, it } from "vitest";

import {
  getAllowedNextStatuses,
  getAdvanceActionLabel,
  getLinearStageIndex,
  isTerminalLeadStatus,
} from "./leadStatusPipeline";

describe("getAllowedNextStatuses", () => {
  it("returns the next linear stage", () => {
    expect(getAllowedNextStatuses("NEW")).toEqual(["CONTACTED"]);
    expect(getAllowedNextStatuses("CONTACTED")).toEqual(["VISIT_SCHEDULED"]);
  });

  it("returns WON and LOST from negotiation", () => {
    expect(getAllowedNextStatuses("NEGOTIATION")).toEqual(["WON", "LOST"]);
  });

  it("returns no next statuses for terminal stages", () => {
    expect(getAllowedNextStatuses("WON")).toEqual([]);
    expect(getAllowedNextStatuses("LOST")).toEqual([]);
  });
});

describe("getAdvanceActionLabel", () => {
  it("returns known action labels", () => {
    expect(getAdvanceActionLabel("CONTACTED")).toBe("Mark as contacted");
    expect(getAdvanceActionLabel("WON")).toBe("Mark as won");
  });

  it("falls back to a generic label for unknown statuses", () => {
    expect(getAdvanceActionLabel("NEW")).toBe("Move to New");
  });
});

describe("isTerminalLeadStatus", () => {
  it("identifies terminal statuses", () => {
    expect(isTerminalLeadStatus("WON")).toBe(true);
    expect(isTerminalLeadStatus("LOST")).toBe(true);
    expect(isTerminalLeadStatus("NEW")).toBe(false);
  });
});

describe("getLinearStageIndex", () => {
  it("returns the index within the linear pipeline", () => {
    expect(getLinearStageIndex("NEW")).toBe(0);
    expect(getLinearStageIndex("NEGOTIATION")).toBe(4);
    expect(getLinearStageIndex("WON")).toBe(-1);
  });
});
