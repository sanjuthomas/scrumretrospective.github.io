import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Retrospective } from "./retroStore";

const fetchRetro = vi.fn();
const saveRetro = vi.fn();
const addRetroCard = vi.fn();
const castRetroVote = vi.fn();
const deleteRetro = vi.fn();

vi.mock("./retroApi", () => ({
  fetchRetro: (...args: unknown[]) => fetchRetro(...args),
  saveRetro: (...args: unknown[]) => saveRetro(...args),
  addRetroCard: (...args: unknown[]) => addRetroCard(...args),
  castRetroVote: (...args: unknown[]) => castRetroVote(...args),
  deleteRetro: (...args: unknown[]) => deleteRetro(...args),
}));

function makeRetro(overrides: Partial<Retrospective> = {}): Retrospective {
  return {
    id: "retro-1",
    name: "Sprint Retro",
    createdAt: 1000,
    template: "fourLs",
    phase: "assembly",
    cards: [],
    participants: [
      {
        id: "fac-1",
        fullName: "Facilitator",
        isFacilitator: true,
        joinedAt: 1000,
      },
    ],
    ...overrides,
  };
}

describe("retroStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("caches and clears retrospectives", async () => {
    const {
      clearCachedRetro,
      fetchRetroFresh,
      getCachedRetro,
    } = await import("./retroStore");

    const retro = makeRetro();
    fetchRetro.mockResolvedValue(retro);

    await fetchRetroFresh("retro-1");
    expect(getCachedRetro("retro-1")?.name).toBe("Sprint Retro");

    clearCachedRetro("retro-1");
    expect(getCachedRetro("retro-1")).toBeNull();
  });

  it("falls back to cache when fetch returns null", async () => {
    const { fetchRetroFresh, getCachedRetro } = await import("./retroStore");
    const retro = makeRetro();

    fetchRetro.mockResolvedValueOnce(retro);
    await fetchRetroFresh("retro-1");

    fetchRetro.mockResolvedValueOnce(null);
    const result = await fetchRetroFresh("retro-1");
    expect(result?.id).toBe("retro-1");
    expect(getCachedRetro("retro-1")).not.toBeNull();
  });

  it("creates a retrospective and saves facilitator session", async () => {
    const { createRetro, getFacilitatorSession } = await import("./retroStore");
    saveRetro.mockImplementation(async (retro) => retro);

    const { retro, participantId } = await createRetro(
      " Team Retro ",
      " Jane Doe ",
      "madSadGlad",
    );

    expect(retro.name).toBe("Team Retro");
    expect(participantId).toBeTruthy();
    expect(saveRetro).toHaveBeenCalled();
    expect(getFacilitatorSession(retro.id)).toBe(participantId);
  });

  it("throws when createRetro cannot save", async () => {
    const { createRetro } = await import("./retroStore");
    saveRetro.mockResolvedValue(null);

    await expect(createRetro("Retro", "Jane")).rejects.toThrow(
      "Could not save retrospective",
    );
  });

  it("adds a new participant or reuses an existing name", async () => {
    const { addParticipant } = await import("./retroStore");
    const retro = makeRetro({
      participants: [
        {
          id: "fac-1",
          fullName: "Facilitator",
          isFacilitator: true,
          joinedAt: 1,
        },
        {
          id: "part-1",
          fullName: "Alex",
          isFacilitator: false,
          joinedAt: 2,
        },
      ],
    });

    fetchRetro.mockResolvedValue(retro);
    const existing = await addParticipant("retro-1", " alex ");
    expect(existing?.participantId).toBe("part-1");
    expect(saveRetro).not.toHaveBeenCalled();

    const updated = makeRetro({
      participants: [...retro.participants, {
        id: "part-2",
        fullName: "Sam",
        isFacilitator: false,
        joinedAt: 3,
      }],
    });
    fetchRetro.mockResolvedValue(retro);
    saveRetro.mockResolvedValue(updated);

    const added = await addParticipant("retro-1", "Sam");
    expect(added?.participantId).toBeTruthy();
    expect(added?.retro.participants.some((p) => p.fullName === "Sam")).toBe(true);
    expect(saveRetro).toHaveBeenCalled();
  });

  it("returns null when adding a participant to a missing retro", async () => {
    const { addParticipant } = await import("./retroStore");
    fetchRetro.mockResolvedValue(null);

    await expect(addParticipant("missing", "Sam")).resolves.toBeNull();
  });

  it("throws when addParticipant cannot save", async () => {
    const { addParticipant } = await import("./retroStore");
    fetchRetro.mockResolvedValue(makeRetro());
    saveRetro.mockResolvedValue(null);

    await expect(addParticipant("retro-1", "Sam")).rejects.toThrow(
      "Could not join retrospective",
    );
  });

  it("manages participant session storage", async () => {
    const {
      getParticipantSession,
      saveParticipantSession,
    } = await import("./retroStore");

    saveParticipantSession("retro-1", "part-1");
    expect(getParticipantSession("retro-1")).toBe("part-1");
    expect(getParticipantSession("other")).toBeNull();
  });

  it("treats missing participant id as not facilitator", async () => {
    const { isCurrentFacilitator } = await import("./retroStore");
    expect(isCurrentFacilitator(makeRetro(), "retro-1", null)).toBe(false);
  });

  it("starts, votes, closes, and ends a retrospective", async () => {
    const {
      closeVoting,
      endRetro,
      getCachedRetro,
      startRetro,
      startVoting,
    } = await import("./retroStore");

    const assembly = makeRetro({ phase: "assembly" });
    const active = makeRetro({ phase: "active", cards: [] });
    const voting = makeRetro({ phase: "voting", cards: [] });
    const results = makeRetro({
      phase: "results",
      cards: [],
      cardVoteCounts: { c1: { up: 2, down: 0 } },
    });

    fetchRetro.mockResolvedValue(assembly);
    saveRetro.mockResolvedValue(active);
    await expect(startRetro("retro-1")).resolves.toMatchObject({ phase: "active" });

    fetchRetro.mockResolvedValue(active);
    saveRetro.mockResolvedValue(voting);
    await expect(startVoting("retro-1")).resolves.toMatchObject({ phase: "voting" });

    fetchRetro.mockResolvedValue(voting);
    saveRetro.mockResolvedValue(results);
    await expect(closeVoting("retro-1", "fac-1")).resolves.toMatchObject({
      phase: "results",
    });

    deleteRetro.mockResolvedValue(true);
    await endRetro("retro-1");
    expect(getCachedRetro("retro-1")).toBeNull();
  });

  it("rejects invalid phase transitions", async () => {
    const { closeVoting, startVoting } = await import("./retroStore");

    fetchRetro.mockResolvedValue(makeRetro({ phase: "assembly" }));
    await expect(startVoting("retro-1")).rejects.toThrow(
      "Voting can only start after the retrospective begins",
    );

    fetchRetro.mockResolvedValue(makeRetro({ phase: "active" }));
    await expect(closeVoting("retro-1")).rejects.toThrow(
      "Voting can only be closed while voting is in progress",
    );
  });

  it("refetches after closeVoting when counts are missing", async () => {
    const { closeVoting } = await import("./retroStore");
    const voting = makeRetro({ phase: "voting" });
    const resultsWithoutCounts = makeRetro({ phase: "results" });
    const resultsWithCounts = makeRetro({
      phase: "results",
      cardVoteCounts: { c1: { up: 1, down: 0 } },
    });

    fetchRetro
      .mockResolvedValueOnce(voting)
      .mockResolvedValueOnce(resultsWithCounts);
    saveRetro.mockResolvedValue(resultsWithoutCounts);

    const closed = await closeVoting("retro-1", "fac-1");
    expect(closed?.cardVoteCounts).toEqual({ c1: { up: 1, down: 0 } });
  });

  it("throws when lifecycle actions cannot persist", async () => {
    const { endRetro, startRetro, startVoting, closeVoting } = await import(
      "./retroStore"
    );

    fetchRetro.mockResolvedValue(makeRetro({ phase: "assembly" }));
    saveRetro.mockResolvedValue(null);
    await expect(startRetro("retro-1")).rejects.toThrow(
      "Could not start retrospective",
    );

    fetchRetro.mockResolvedValue(makeRetro({ phase: "active" }));
    saveRetro.mockResolvedValue(null);
    await expect(startVoting("retro-1")).rejects.toThrow("Could not start voting");

    fetchRetro.mockResolvedValue(makeRetro({ phase: "voting" }));
    saveRetro.mockResolvedValue(null);
    await expect(closeVoting("retro-1")).rejects.toThrow("Could not close voting");

    deleteRetro.mockResolvedValue(false);
    await expect(endRetro("retro-1")).rejects.toThrow("Could not end retrospective");
  });

  it("returns null when lifecycle actions target a missing retro", async () => {
    const { closeVoting, startRetro, startVoting } = await import("./retroStore");
    fetchRetro.mockResolvedValue(null);

    await expect(startRetro("missing")).resolves.toBeNull();
    await expect(startVoting("missing")).resolves.toBeNull();
    await expect(closeVoting("missing")).resolves.toBeNull();
  });

  it("adds cards and casts votes through the API", async () => {
    const { addCard, castVote } = await import("./retroStore");
    const updated = makeRetro({
      phase: "active",
      cards: [
        {
          id: "card-1",
          column: "liked",
          text: "Great teamwork",
          authorId: "fac-1",
          createdAt: 2,
        },
      ],
    });

    addRetroCard.mockResolvedValue(updated);
    await expect(
      addCard("retro-1", "fac-1", "liked", "Great teamwork"),
    ).resolves.toMatchObject({ cards: updated.cards });
    await expect(addCard("retro-1", "fac-1", "liked", "   ")).resolves.toBeNull();

    castRetroVote.mockResolvedValue(updated);
    await expect(
      castVote("retro-1", "fac-1", "card-1", "up"),
    ).resolves.toMatchObject({ id: "retro-1" });
  });

  it("polls retrospective updates for subscribers", async () => {
    vi.useFakeTimers();
    const { subscribeRetro } = await import("./retroStore");

    const retro = makeRetro();
    const active = makeRetro({ phase: "active" });
    fetchRetro.mockResolvedValue(retro);

    const listener = vi.fn();
    const unsubscribe = subscribeRetro("retro-1", listener, "fac-1");

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith(retro, false);
    });

    fetchRetro.mockResolvedValue(active);
    await vi.advanceTimersByTimeAsync(1000);

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith(active, false);
    });

    unsubscribe();
    listener.mockClear();
    await vi.advanceTimersByTimeAsync(1000);
    expect(listener).not.toHaveBeenCalled();
  });

  it("notifies subscribers with loading state when cache is empty", async () => {
    vi.useFakeTimers();
    const { subscribeRetro } = await import("./retroStore");

    const retro = makeRetro();
    fetchRetro.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(retro), 50)),
    );

    const listener = vi.fn();
    const unsubscribe = subscribeRetro("retro-2", listener);

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith(null, true);
    });

    await vi.advanceTimersByTimeAsync(50);
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith(retro, false);
    });

    unsubscribe();
  });

  it("normalizes legacy initiator role when caching", async () => {
    const { fetchRetroFresh, getCachedRetro } = await import("./retroStore");
    fetchRetro.mockResolvedValue({
      ...makeRetro(),
      participants: [
        {
          id: "fac-1",
          fullName: "Facilitator",
          isInitiator: true,
          joinedAt: 1,
        },
      ],
    });

    await fetchRetroFresh("retro-1");
    expect(getCachedRetro("retro-1")?.participants[0]?.isFacilitator).toBe(true);
  });
});
