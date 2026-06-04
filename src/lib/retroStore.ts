import { addRetroCard, castRetroVote, deleteRetro, fetchRetro, saveRetro } from "./retroApi";
import type { CardVoteCounts } from "./votes";

export interface Participant {
  id: string;
  fullName: string;
  isInitiator: boolean;
  joinedAt: number;
  /** Set by sync server from presence heartbeats; defaults to false when absent */
  online?: boolean;
  /** Server-only heartbeat timestamp; never sent from the client */
  lastSeen?: number;
}

export type RetroPhase = "assembly" | "active" | "voting" | "results";

export type VoteValue = "up" | "down";

export type FourLsColumn = "liked" | "learned" | "lacked" | "longedFor";

export interface RetroCard {
  id: string;
  column: FourLsColumn;
  text: string;
  authorId: string;
  createdAt: number;
}

export interface Retrospective {
  id: string;
  name: string;
  createdAt: number;
  participants: Participant[];
  phase?: RetroPhase;
  cards?: RetroCard[];
  /** Current participant's votes during voting; counts are never exposed */
  myVotes?: Partial<Record<string, VoteValue>>;
  /** Aggregated vote totals per card after voting closes */
  cardVoteCounts?: Partial<Record<string, CardVoteCounts>>;
}

const PARTICIPANT_SESSION_PREFIX = "scrum-retro-participant:";

const memoryCache = new Map<string, Retrospective>();

function cacheRetro(retro: Retrospective): void {
  memoryCache.set(retro.id, retro);
}

export function getCachedRetro(id: string): Retrospective | null {
  return memoryCache.get(id) ?? null;
}

export function clearCachedRetro(id: string): void {
  memoryCache.delete(id);
}

/** Always fetches latest state from the sync server and updates the cache. */
export async function fetchRetroFresh(
  id: string,
  participantId?: string | null,
): Promise<Retrospective | null> {
  const remote = await fetchRetro(id, participantId ?? undefined);
  if (remote) {
    cacheRetro(remote);
    return remote;
  }
  return memoryCache.get(id) ?? null;
}

export async function loadRetro(id: string): Promise<Retrospective | null> {
  return fetchRetroFresh(id);
}

export async function createRetro(
  retroName: string,
  initiatorFullName: string,
): Promise<{ retro: Retrospective; participantId: string }> {
  const id = crypto.randomUUID();
  const participantId = crypto.randomUUID();
  const retro: Retrospective = {
    id,
    name: retroName.trim(),
    createdAt: Date.now(),
    phase: "assembly",
    cards: [],
    participants: [
      {
        id: participantId,
        fullName: initiatorFullName.trim(),
        isInitiator: true,
        joinedAt: Date.now(),
      },
    ],
  };
  cacheRetro(retro);
  const saved = await saveRetro(retro);
  if (!saved) {
    throw new Error("Could not save retrospective. Is the sync server running?");
  }
  cacheRetro(saved);
  return { retro: saved, participantId };
}

export async function addParticipant(
  retroId: string,
  fullName: string,
): Promise<{ retro: Retrospective; participantId: string } | null> {
  const retro = await fetchRetroFresh(retroId);
  if (!retro) return null;

  const trimmed = fullName.trim();
  const existing = retro.participants.find(
    (p) => p.fullName.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) {
    return { retro, participantId: existing.id };
  }

  const participantId = crypto.randomUUID();
  const updated: Retrospective = {
    ...retro,
    participants: [
      ...retro.participants,
      {
        id: participantId,
        fullName: trimmed,
        isInitiator: false,
        joinedAt: Date.now(),
      },
    ],
  };
  cacheRetro(updated);
  const saved = await saveRetro(updated);
  if (!saved) {
    throw new Error("Could not join retrospective. Is the sync server running?");
  }
  cacheRetro(saved);
  return { retro: saved, participantId };
}

export function saveParticipantSession(
  retroId: string,
  participantId: string,
): void {
  sessionStorage.setItem(
    `${PARTICIPANT_SESSION_PREFIX}${retroId}`,
    participantId,
  );
}

export function getParticipantSession(retroId: string): string | null {
  return sessionStorage.getItem(`${PARTICIPANT_SESSION_PREFIX}${retroId}`);
}

export function getJoinUrl(retroId: string): string {
  return `${window.location.origin}/join/${retroId}`;
}

export async function startRetro(
  retroId: string,
): Promise<Retrospective | null> {
  const retro = await fetchRetroFresh(retroId);
  if (!retro) return null;

  const updated: Retrospective = {
    ...retro,
    phase: "active",
    cards: retro.cards ?? [],
  };
  cacheRetro(updated);
  const saved = await saveRetro(updated);
  if (!saved) {
    throw new Error("Could not start retrospective. Is the sync server running?");
  }
  cacheRetro(saved);
  return saved;
}

export async function startVoting(
  retroId: string,
): Promise<Retrospective | null> {
  const retro = await fetchRetroFresh(retroId);
  if (!retro) return null;
  if ((retro.phase ?? "assembly") !== "active") {
    throw new Error("Voting can only start after the retrospective begins.");
  }

  const updated: Retrospective = {
    ...retro,
    phase: "voting",
    cards: retro.cards ?? [],
  };
  cacheRetro(updated);
  const saved = await saveRetro(updated);
  if (!saved) {
    throw new Error("Could not start voting. Is the sync server running?");
  }
  cacheRetro(saved);
  return saved;
}

export async function closeVoting(
  retroId: string,
  participantId?: string | null,
): Promise<Retrospective | null> {
  const retro = await fetchRetroFresh(retroId, participantId);
  if (!retro) return null;
  if ((retro.phase ?? "assembly") !== "voting") {
    throw new Error("Voting can only be closed while voting is in progress.");
  }

  const updated: Retrospective = {
    ...retro,
    phase: "results",
    cards: retro.cards ?? [],
  };
  const saved = await saveRetro(updated);
  if (!saved) {
    throw new Error("Could not close voting. Is the sync server running?");
  }
  cacheRetro(saved);
  if (saved.cardVoteCounts != null) {
    return saved;
  }
  return fetchRetroFresh(retroId, participantId);
}

export async function endRetro(retroId: string): Promise<void> {
  const deleted = await deleteRetro(retroId);
  if (!deleted) {
    throw new Error("Could not end retrospective. Is the sync server running?");
  }
  clearCachedRetro(retroId);
}

export async function addCard(
  retroId: string,
  participantId: string,
  column: FourLsColumn,
  text: string,
): Promise<Retrospective | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const updated = await addRetroCard(retroId, {
    participantId,
    column,
    text: trimmed,
  });
  if (updated) {
    cacheRetro(updated);
  }
  return updated;
}

export async function castVote(
  retroId: string,
  participantId: string,
  cardId: string,
  value: VoteValue,
): Promise<Retrospective | null> {
  const updated = await castRetroVote(retroId, {
    participantId,
    cardId,
    value,
  });
  if (updated) {
    cacheRetro(updated);
  }
  return updated;
}

type RetroListener = (retro: Retrospective | null, loading: boolean) => void;

const POLL_INTERVAL_MS = 1000;

function participantPresenceKey(retro: Retrospective): string {
  return retro.participants
    .map((p) => `${p.id}:${p.online === true ? 1 : 0}`)
    .join("|");
}

function cardsKey(retro: Retrospective): string {
  return JSON.stringify(retro.cards ?? []);
}

function myVotesKey(retro: Retrospective): string {
  return JSON.stringify(retro.myVotes ?? {});
}

function cardVoteCountsKey(retro: Retrospective): string {
  return JSON.stringify(retro.cardVoteCounts ?? {});
}

function retroChanged(
  prev: Retrospective | null,
  next: Retrospective | null,
): boolean {
  if (prev === next) return false;
  if (!prev || !next) return prev !== next;
  if (prev.id !== next.id || prev.name !== next.name) return true;
  if ((prev.phase ?? "assembly") !== (next.phase ?? "assembly")) return true;
  if (prev.participants.length !== next.participants.length) return true;
  if (participantPresenceKey(prev) !== participantPresenceKey(next)) {
    return true;
  }
  if (cardsKey(prev) !== cardsKey(next)) return true;
  if (myVotesKey(prev) !== myVotesKey(next)) return true;
  if (cardVoteCountsKey(prev) !== cardVoteCountsKey(next)) return true;
  return (
    JSON.stringify(prev.participants.map((p) => p.fullName)) !==
    JSON.stringify(next.participants.map((p) => p.fullName))
  );
}

export function subscribeRetro(
  retroId: string,
  listener: RetroListener,
  participantId?: string | null,
): () => void {
  let cancelled = false;
  let lastRetro: Retrospective | null = memoryCache.get(retroId) ?? null;

  const poll = async (isInitial: boolean) => {
    if (cancelled) return;

    if (isInitial && !lastRetro) {
      listener(null, true);
    }

    const retro = await fetchRetroFresh(retroId, participantId);
    if (cancelled) return;

    if (retroChanged(lastRetro, retro)) {
      lastRetro = retro;
      listener(retro, false);
    } else if (isInitial) {
      listener(retro, false);
    }
  };

  poll(true);
  const interval = window.setInterval(() => poll(false), POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}
