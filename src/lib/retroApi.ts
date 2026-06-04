import type { Retrospective } from "./retroStore";

const API_BASE =
  import.meta.env.VITE_SYNC_API_URL?.replace(/\/$/, "") ?? "/api";

export async function fetchRetro(id: string): Promise<Retrospective | null> {
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return (await res.json()) as Retrospective;
  } catch {
    return null;
  }
}

export async function saveRetro(retro: Retrospective): Promise<boolean> {
  const payload = {
    ...retro,
    participants: retro.participants.map(
      ({ online: _online, lastSeen: _lastSeen, ...p }) => p,
    ),
  };
  try {
    const res = await fetch(`${API_BASE}/retrospectives/${retro.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
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
