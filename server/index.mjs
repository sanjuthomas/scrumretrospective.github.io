import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? process.env.SYNC_PORT) || 8787;
const PRESENCE_TIMEOUT_MS = 12000;

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ??
  "https://scrumretrospective.org,https://www.scrumretrospective.org"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const TEMPLATE_COLUMNS = {
  fourLs: new Set(["liked", "learned", "lacked", "longedFor"]),
  fourWs: new Set(["wentWell", "didNotGoWell", "learned", "shouldChange"]),
  madSadGlad: new Set(["mad", "sad", "glad"]),
};

const VALID_VOTE_VALUES = new Set(["up", "down"]);

const rooms = new Map();

function roomTemplate(room) {
  return room?.template ?? "fourLs";
}

function normalizeRoomTemplate(room, fallbackTemplate) {
  return room?.template ?? fallbackTemplate ?? "fourLs";
}

function isValidColumnForRoom(room, column) {
  const allowed = TEMPLATE_COLUMNS[roomTemplate(room)];
  return allowed?.has(column) ?? false;
}

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}

function send(res, status, body, origin) {
  res.writeHead(status, corsHeaders(origin));
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : null);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function stripEphemeralFields(room) {
  return {
    ...room,
    participants: room.participants.map(normalizeStoredParticipant),
  };
}

function participantIsFacilitator(participant) {
  return Boolean(participant?.isFacilitator ?? participant?.isInitiator);
}

function normalizeStoredParticipant(participant) {
  const { online: _online, lastSeen: _lastSeen, isInitiator: _isInitiator, ...rest } =
    participant;
  return {
    ...rest,
    isFacilitator: participantIsFacilitator(participant),
  };
}

function isOnline(lastSeen) {
  return (
    typeof lastSeen === "number" &&
    lastSeen > 0 &&
    Date.now() - lastSeen < PRESENCE_TIMEOUT_MS
  );
}

function enrichRoomWithPresence(room) {
  return {
    ...room,
    cards: room.cards ?? [],
    votes: room.votes ?? [],
    participants: room.participants.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      isFacilitator: participantIsFacilitator(p),
      joinedAt: p.joinedAt,
      online: isOnline(p.lastSeen),
    })),
  };
}

function enrichRoomForClient(room, participantId) {
  const enriched = enrichRoomWithPresence(room);
  const { votes: _votes, ...clientRoom } = enriched;
  const phase = room.phase ?? "assembly";

  if (participantId && phase === "voting") {
    const myVotes = {};
    for (const vote of room.votes ?? []) {
      if (vote.participantId === participantId) {
        myVotes[vote.cardId] = vote.value;
      }
    }
    clientRoom.myVotes = myVotes;
  }

  if (phase === "results") {
    clientRoom.cardVoteCounts = computeCardVoteCounts(room.votes);
  }

  return clientRoom;
}

function computeCardVoteCounts(votes) {
  const counts = {};
  for (const vote of votes ?? []) {
    if (!counts[vote.cardId]) {
      counts[vote.cardId] = { up: 0, down: 0 };
    }
    if (vote.value === "up") {
      counts[vote.cardId].up += 1;
    } else if (vote.value === "down") {
      counts[vote.cardId].down += 1;
    }
  }
  return counts;
}

function updateParticipantLastSeen(room, participantId, lastSeen) {
  return {
    ...room,
    participants: room.participants.map((p) =>
      p.id === participantId ? { ...p, lastSeen } : p,
    ),
  };
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (url.pathname === "/api/health" && req.method === "GET") {
    send(res, 200, { ok: true }, origin);
    return;
  }

  const leaveMatch = url.pathname.match(
    /^\/api\/retrospectives\/([^/]+)\/presence\/leave$/,
  );
  if (leaveMatch && req.method === "POST") {
    const roomId = decodeURIComponent(leaveMatch[1]);
    try {
      const body = await readBody(req);
      if (!body?.participantId) {
        send(res, 400, { error: "participantId required" }, origin);
        return;
      }
      const room = rooms.get(roomId);
      if (room) {
        rooms.set(
          roomId,
          updateParticipantLastSeen(room, body.participantId, 0),
        );
      }
      send(res, 200, { ok: true }, origin);
      return;
    } catch {
      send(res, 400, { error: "Invalid JSON" }, origin);
      return;
    }
  }

  const heartbeatMatch = url.pathname.match(
    /^\/api\/retrospectives\/([^/]+)\/presence$/,
  );
  if (heartbeatMatch && req.method === "POST") {
    const roomId = decodeURIComponent(heartbeatMatch[1]);
    try {
      const body = await readBody(req);
      if (!body?.participantId) {
        send(res, 400, { error: "participantId required" }, origin);
        return;
      }
      const room = rooms.get(roomId);
      if (
        !room?.participants?.some((p) => p.id === body.participantId)
      ) {
        send(res, 404, { error: "Participant not found" }, origin);
        return;
      }
      rooms.set(
        roomId,
        updateParticipantLastSeen(room, body.participantId, Date.now()),
      );
      send(res, 200, { ok: true }, origin);
      return;
    } catch {
      send(res, 400, { error: "Invalid JSON" }, origin);
      return;
    }
  }

  const cardMatch = url.pathname.match(
    /^\/api\/retrospectives\/([^/]+)\/cards$/,
  );
  if (cardMatch && req.method === "POST") {
    const roomId = decodeURIComponent(cardMatch[1]);
    try {
      const body = await readBody(req);
      const participantId = body?.participantId;
      const column = body?.column;
      const text = typeof body?.text === "string" ? body.text.trim() : "";

      if (!participantId || !column || !text) {
        send(
          res,
          400,
          { error: "participantId, column, and text are required" },
          origin,
        );
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(res, 404, { error: "Not found" }, origin);
        return;
      }
      if (!isValidColumnForRoom(room, column)) {
        send(res, 400, { error: "Invalid column" }, origin);
        return;
      }
      if ((room.phase ?? "assembly") !== "active") {
        send(
          res,
          403,
          {
            error:
              (room.phase ?? "assembly") === "voting"
                ? "Adding items is closed during voting"
                : "Retrospective has not started yet",
          },
          origin,
        );
        return;
      }
      if (!room.participants?.some((p) => p.id === participantId)) {
        send(res, 403, { error: "Participant not found" }, origin);
        return;
      }

      const card = {
        id: randomUUID(),
        column,
        text,
        authorId: participantId,
        createdAt: Date.now(),
      };
      const updated = {
        ...room,
        cards: [...(room.cards ?? []), card],
      };
      rooms.set(roomId, updated);
      send(res, 200, enrichRoomForClient(updated, participantId), origin);
      return;
    } catch {
      send(res, 400, { error: "Invalid JSON" }, origin);
      return;
    }
  }

  const voteMatch = url.pathname.match(
    /^\/api\/retrospectives\/([^/]+)\/votes$/,
  );
  if (voteMatch && req.method === "POST") {
    const roomId = decodeURIComponent(voteMatch[1]);
    try {
      const body = await readBody(req);
      const participantId = body?.participantId;
      const cardId = body?.cardId;
      const value = body?.value;

      if (!participantId || !cardId || !value) {
        send(
          res,
          400,
          { error: "participantId, cardId, and value are required" },
          origin,
        );
        return;
      }
      if (!VALID_VOTE_VALUES.has(value)) {
        send(res, 400, { error: "Invalid vote value" }, origin);
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(res, 404, { error: "Not found" }, origin);
        return;
      }
      if ((room.phase ?? "assembly") !== "voting") {
        send(res, 403, { error: "Voting is not open yet" }, origin);
        return;
      }
      if (!room.participants?.some((p) => p.id === participantId)) {
        send(res, 403, { error: "Participant not found" }, origin);
        return;
      }

      const card = (room.cards ?? []).find((c) => c.id === cardId);
      if (!card) {
        send(res, 404, { error: "Card not found" }, origin);
        return;
      }
      if (card.authorId === participantId) {
        send(res, 403, { error: "You cannot vote on your own item" }, origin);
        return;
      }

      const votes = [...(room.votes ?? [])];
      const existingIndex = votes.findIndex(
        (v) => v.participantId === participantId && v.cardId === cardId,
      );
      if (existingIndex >= 0 && votes[existingIndex].value === value) {
        votes.splice(existingIndex, 1);
      } else if (existingIndex >= 0) {
        votes[existingIndex] = {
          ...votes[existingIndex],
          value,
        };
      } else {
        votes.push({
          id: randomUUID(),
          cardId,
          participantId,
          value,
          createdAt: Date.now(),
        });
      }

      const updated = { ...room, votes };
      rooms.set(roomId, updated);
      send(res, 200, enrichRoomForClient(updated, participantId), origin);
      return;
    } catch {
      send(res, 400, { error: "Invalid JSON" }, origin);
      return;
    }
  }

  const match = url.pathname.match(/^\/api\/retrospectives\/([^/]+)$/);
  if (!match) {
    send(res, 404, { error: "Not found" }, origin);
    return;
  }

  const id = decodeURIComponent(match[1]);

  if (req.method === "GET") {
    const room = rooms.get(id);
    if (!room) {
      send(res, 404, { error: "Not found" }, origin);
      return;
    }
    const participantId = url.searchParams.get("participantId");
    send(res, 200, enrichRoomForClient(room, participantId), origin);
    return;
  }

  if (req.method === "PUT") {
    try {
      const body = await readBody(req);
      if (!body?.id || body.id !== id) {
        send(res, 400, { error: "Invalid retrospective payload" }, origin);
        return;
      }
      const existing = rooms.get(id);
      const stripped = stripEphemeralFields(body);
      delete stripped.votes;
      delete stripped.myVotes;
      delete stripped.cardVoteCounts;

      if (existing) {
        const lastSeenById = new Map(
          existing.participants.map((p) => [p.id, p.lastSeen]),
        );
        stripped.participants = stripped.participants.map((p) => ({
          ...p,
          lastSeen: lastSeenById.get(p.id),
        }));
        if (!stripped.cards) {
          stripped.cards = existing.cards ?? [];
        }
        stripped.votes = existing.votes ?? [];
        stripped.template = normalizeRoomTemplate(stripped, existing.template);

        const existingPhase = existing.phase ?? "assembly";
        const nextPhase = stripped.phase ?? existingPhase;
        if (nextPhase === "voting" && existingPhase === "assembly") {
          send(
            res,
            403,
            { error: "Start the retrospective before opening voting" },
            origin,
          );
          return;
        }
        if (nextPhase === "active" && existingPhase === "voting") {
          send(res, 403, { error: "Cannot return to retrospective phase" }, origin);
          return;
        }
        if (
          nextPhase === "results" &&
          existingPhase !== "voting" &&
          existingPhase !== "results"
        ) {
          send(res, 403, { error: "Close voting before viewing results" }, origin);
          return;
        }
        if (nextPhase === "voting" && existingPhase === "results") {
          send(res, 403, { error: "Voting is already closed" }, origin);
          return;
        }
        if (nextPhase === "active" && existingPhase === "results") {
          send(res, 403, { error: "Cannot return to retrospective phase" }, origin);
          return;
        }
        stripped.phase = nextPhase;
      } else {
        stripped.votes = [];
        stripped.template = normalizeRoomTemplate(stripped, "fourLs");
      }
      if (!stripped.cards) {
        stripped.cards = [];
      }
      stripped.participants = stripped.participants.map(normalizeStoredParticipant);
      rooms.set(id, stripped);
      send(res, 200, enrichRoomForClient(rooms.get(id)), origin);
      return;
    } catch {
      send(res, 400, { error: "Invalid JSON" }, origin);
      return;
    }
  }

  if (req.method === "DELETE") {
    if (!rooms.has(id)) {
      send(res, 404, { error: "Not found" }, origin);
      return;
    }
    rooms.delete(id);
    send(res, 200, { ok: true }, origin);
    return;
  }

  send(res, 405, { error: "Method not allowed" }, origin);
});

server.listen(PORT, () => {
  console.log(`Retro sync API listening on http://localhost:${PORT}`);
});
