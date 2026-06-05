import { describe, expect, it } from "vitest";
import { effectiveVote } from "./votes";

describe("effectiveVote", () => {
  it("returns zero when counts are missing", () => {
    expect(effectiveVote(undefined)).toBe(0);
  });

  it("subtracts down votes from up votes", () => {
    expect(effectiveVote({ up: 4, down: 1 })).toBe(3);
    expect(effectiveVote({ up: 1, down: 4 })).toBe(-3);
  });
});
