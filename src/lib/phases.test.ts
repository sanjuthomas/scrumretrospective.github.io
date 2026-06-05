import { describe, expect, it } from "vitest";
import { getPhaseLabel, isResultsPhase } from "./phases";

describe("phases", () => {
  it("labels each phase", () => {
    expect(getPhaseLabel("assembly")).toBe("Phase 1 — Team assembly");
    expect(getPhaseLabel("active")).toBe("Phase 2 — Retrospective");
    expect(getPhaseLabel("voting")).toBe("Phase 3 — Voting");
    expect(getPhaseLabel("results")).toBe("Phase 4 — Results");
  });

  it("defaults missing phase to assembly", () => {
    expect(getPhaseLabel(undefined)).toBe("Phase 1 — Team assembly");
  });

  it("detects results phase", () => {
    expect(isResultsPhase("results")).toBe(true);
    expect(isResultsPhase("voting")).toBe(false);
    expect(isResultsPhase(undefined)).toBe(false);
  });
});
