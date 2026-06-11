import type { RetroColumnId, Retrospective, VoteValue } from "./retroStore";
import { normalizeParticipant } from "./participants";
import { normalizeTemplate } from "./templates";

const API_BASE =
  import.meta.env.VITE_SYNC_API_URL?.replace(/\/$/, "") ?? "/api";

function normalizeRetroParticipants(retro: Retrospective): Retrospective {
  return {
    ...retro,
    participants: retro.participants.map(normalizeParticipant),
    ...(retro.template !== undefined
      ? { template: normalizeTemplate(retro.template) }
      : {}),
  };
}

export async function fetchRetro(
  id: string,
  participantId?: string,
): Promise<Retrospective | null> {
  try {
    const query = participantId
      ? `?participantId=${encodeURIComponent(participantId)}`
      : "";
    const res = await fetch(`${API_BASE}/retrospectives/${id}${query}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const retro = (await res.json()) as Retrospective;
    return normalizeRetroParticipants(retro);
  } catch {
    return null;
  }
}

export async function saveRetro(retro: Retrospective): Promise<Retrospective | null> {
  const {
    myVotes: _myVotes,
    cardVoteCounts: _cardVoteCounts,
    template,
    ...rest
  } = retro;
  const payload = {
    ...rest,
    participants: retro.participants.map(
      ({ online: _online, lastSeen: _lastSeen, ...p }) => p,
    ),
    ...(template !== undefined
      ? { template: normalizeTemplate(template) }
      : {}),
  };
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${retro.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const saved = (await res.json()) as Retrospective;
    return normalizeRetroParticipants(saved);
  } catch {
    return null;
  }
}

export async function sendPresenceHeartbeat(
  retroId: string,
  participantId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${retroId}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addRetroCard(
  retroId: string,
  payload: {
    participantId: string;
    column: RetroColumnId;
    text: string;
  },
): Promise<Retrospective | null> {
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${retroId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? `add card failed: ${res.status}`);
    }
    return (await res.json()) as Retrospective;
  } catch (err) {
    if (err instanceof Error) throw err;
    return null;
  }
}

export async function castRetroVote(
  retroId: string,
  payload: {
    participantId: string;
    cardId: string;
    value: VoteValue;
  },
): Promise<Retrospective | null> {
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${retroId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? `vote failed: ${res.status}`);
    }
    return (await res.json()) as Retrospective;
  } catch (err) {
    if (err instanceof Error) throw err;
    return null;
  }
}

export async function transferRetroFacilitator(
  retroId: string,
  payload: {
    fromParticipantId: string;
    toParticipantId: string;
  },
): Promise<Retrospective | null> {
  try {
    const res = await fetch(
      `${API_BASE}/retrospectives/${retroId}/facilitator/transfer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? `transfer failed: ${res.status}`);
    }
    const retro = (await res.json()) as Retrospective;
    return normalizeRetroParticipants(retro);
  } catch (err) {
    if (err instanceof Error) throw err;
    return null;
  }
}

export async function deleteRetro(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function sendPresenceLeave(
  retroId: string,
  participantId: string,
): void {
  const url = `${API_BASE}/retrospectives/${retroId}/presence/leave`;
  const body = JSON.stringify({ participantId });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
