import { describe, expect, it } from "vitest";
import { normalizeParticipant, participantIsFacilitator } from "./participants";

describe("participant role helpers", () => {
  it("prefers isFacilitator when present", () => {
    expect(participantIsFacilitator({ isFacilitator: true })).toBe(true);
    expect(participantIsFacilitator({ isFacilitator: false })).toBe(false);
  });

  it("falls back to legacy isInitiator", () => {
    expect(participantIsFacilitator({ isInitiator: true })).toBe(true);
    expect(participantIsFacilitator({ isInitiator: false })).toBe(false);
  });

  it("normalizes facilitator flags on participant objects", () => {
    expect(
      normalizeParticipant({
        id: "p1",
        fullName: "Alex",
        isInitiator: true,
        joinedAt: 1,
      }),
    ).toMatchObject({
      id: "p1",
      isFacilitator: true,
    });
  });
});
