import { afterEach, describe, expect, it } from "vitest";
import type { Retrospective } from "./retroStore";
import {
  clearFacilitatorSession,
  getFacilitatorSession,
  getJoinUrl,
  isCurrentFacilitator,
  saveFacilitatorSession,
  saveParticipantSession,
} from "./retroStore";

const retroId = "retro-123";

const retro: Retrospective = {
  id: retroId,
  name: "Sprint Retro",
  createdAt: 1,
  phase: "assembly",
  participants: [
    {
      id: "fac-1",
      fullName: "Facilitator",
      isFacilitator: true,
      joinedAt: 1,
    },
    {
      id: "part-1",
      fullName: "Participant",
      isFacilitator: false,
      joinedAt: 2,
    },
  ],
};

afterEach(() => {
  sessionStorage.clear();
});

describe("session helpers", () => {
  it("builds join URLs from the current origin", () => {
    expect(getJoinUrl(retroId)).toBe(`${window.location.origin}/join/${retroId}`);
  });

  it("detects facilitator from participant role", () => {
    expect(isCurrentFacilitator(retro, retroId, "fac-1")).toBe(true);
    expect(isCurrentFacilitator(retro, retroId, "part-1")).toBe(false);
  });

  it("uses server facilitator role when the participant is in the retro", () => {
    saveFacilitatorSession(retroId, "fac-1");

    const transferred: Retrospective = {
      ...retro,
      participants: retro.participants.map((participant) => ({
        ...participant,
        isFacilitator: participant.id === "part-1",
      })),
    };

    expect(isCurrentFacilitator(transferred, retroId, "fac-1")).toBe(false);
    expect(isCurrentFacilitator(transferred, retroId, "part-1")).toBe(true);
  });

  it("clears stored facilitator session keys", () => {
    saveFacilitatorSession(retroId, "fac-1");
    clearFacilitatorSession(retroId);
    expect(getFacilitatorSession(retroId)).toBeNull();
  });

  it("falls back to facilitator session before the participant list is available", () => {
    saveFacilitatorSession(retroId, "fac-1");

    const emptyParticipants: Retrospective = {
      ...retro,
      participants: [],
    };

    expect(isCurrentFacilitator(emptyParticipants, retroId, "fac-1")).toBe(
      true,
    );
    expect(getFacilitatorSession(retroId)).toBe("fac-1");
  });
});
