import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiJson, startSyncServer, type SyncServerHandle } from "./helpers";

interface Participant {
  id: string;
  fullName: string;
  isFacilitator: boolean;
  joinedAt: number;
}

interface RetroCard {
  id: string;
  column: string;
  text: string;
  authorId: string;
  createdAt: number;
}

interface RetroResponse {
  id: string;
  name: string;
  createdAt: number;
  template?: string;
  phase?: string;
  participants: Participant[];
  cards?: RetroCard[];
  myVotes?: Record<string, string>;
  cardVoteCounts?: Record<string, { up: number; down: number }>;
}

let server: SyncServerHandle;

beforeAll(async () => {
  server = await startSyncServer();
}, 30_000);

afterAll(async () => {
  await server.stop();
});

describe("retro end-to-end flow", () => {
  it("runs assembly through results on the sync API", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();
    const participantId = crypto.randomUUID();

    const create = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: retroId,
          name: "Integration Retro",
          createdAt: Date.now(),
          template: "fourLs",
          phase: "assembly",
          cards: [],
          participants: [
            {
              id: facilitatorId,
              fullName: "Facilitator",
              isFacilitator: true,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    expect(create.status).toBe(200);
    expect(create.body.participants[0]?.isFacilitator).toBe(true);

    const join = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...create.body,
          participants: [
            ...create.body.participants,
            {
              id: participantId,
              fullName: "Participant",
              isFacilitator: false,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    expect(join.status).toBe(200);
    expect(join.body.participants).toHaveLength(2);

    const start = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...join.body,
          phase: "active",
        }),
      },
    );

    expect(start.status).toBe(200);
    expect(start.body.phase).toBe("active");

    const facilitatorCard = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "liked",
          text: "Shipped on time",
        }),
      },
    );

    const participantCard = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: participantId,
          column: "learned",
          text: "Better test coverage",
        }),
      },
    );

    expect(facilitatorCard.status).toBe(200);
    expect(participantCard.status).toBe(200);
    expect(participantCard.body.cards).toHaveLength(2);

    const openVoting = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...participantCard.body,
          phase: "voting",
        }),
      },
    );

    expect(openVoting.status).toBe(200);
    expect(openVoting.body.phase).toBe("voting");

    const facilitatorCardId = facilitatorCard.body.cards?.[0]?.id;
    const participantCardId = participantCard.body.cards?.find(
      (card) => card.authorId === participantId,
    )?.id;

    expect(facilitatorCardId).toBeTruthy();
    expect(participantCardId).toBeTruthy();

    const vote = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/votes`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId,
          cardId: facilitatorCardId,
          value: "up",
        }),
      },
    );

    expect(vote.status).toBe(200);
    expect(vote.body.myVotes?.[facilitatorCardId!]).toBe("up");
    expect(vote.body.cardVoteCounts).toBeUndefined();

    const selfVote = await apiJson<{ error?: string }>(
      server.apiBase,
      `/retrospectives/${retroId}/votes`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId,
          cardId: participantCardId,
          value: "up",
        }),
      },
    );

    expect(selfVote.status).toBe(403);

    const closeVoting = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...vote.body,
          phase: "results",
        }),
      },
    );

    expect(closeVoting.status).toBe(200);
    expect(closeVoting.body.phase).toBe("results");
    expect(closeVoting.body.cardVoteCounts?.[facilitatorCardId!]).toEqual({
      up: 1,
      down: 0,
    });

    const remove = await apiJson<{ ok: boolean }>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      { method: "DELETE" },
    );

    expect(remove.status).toBe(200);
    expect(remove.body.ok).toBe(true);

    const missing = await apiJson<{ error: string }>(
      server.apiBase,
      `/retrospectives/${retroId}`,
    );

    expect(missing.status).toBe(404);
  });

  it("normalizes legacy isInitiator facilitator flags", async () => {
    const retroId = crypto.randomUUID();

    const create = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: retroId,
          name: "Legacy Retro",
          createdAt: Date.now(),
          phase: "assembly",
          cards: [],
          participants: [
            {
              id: "legacy-fac",
              fullName: "Legacy Facilitator",
              isInitiator: true,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    expect(create.status).toBe(200);
    expect(create.body.participants[0]?.isFacilitator).toBe(true);

    const fetched = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
    );

    expect(fetched.status).toBe(200);
    expect(fetched.body.participants[0]?.isFacilitator).toBe(true);
  });

  it("supports Mad, Sad, Glad columns for that template", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();

    const create = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: retroId,
          name: "MSG Retro",
          createdAt: Date.now(),
          template: "madSadGlad",
          phase: "active",
          cards: [],
          participants: [
            {
              id: facilitatorId,
              fullName: "Facilitator",
              isFacilitator: true,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    expect(create.status).toBe(200);
    expect(create.body.template).toBe("madSadGlad");

    const gladCard = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "glad",
          text: "Great teamwork",
        }),
      },
    );

    expect(gladCard.status).toBe(200);
    expect(gladCard.body.cards?.[0]?.column).toBe("glad");

    const invalidColumn = await apiJson<{ error?: string }>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "liked",
          text: "Wrong template column",
        }),
      },
    );

    expect(invalidColumn.status).toBe(400);
  });

  it("preserves Mad Sad Glad template when a phase update omits template", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();

    await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: retroId,
          name: "MSG Retro",
          createdAt: Date.now(),
          template: "madSadGlad",
          phase: "assembly",
          cards: [],
          participants: [
            {
              id: facilitatorId,
              fullName: "Facilitator",
              isFacilitator: true,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    const start = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: retroId,
          name: "MSG Retro",
          createdAt: Date.now(),
          phase: "active",
          cards: [],
          participants: [
            {
              id: facilitatorId,
              fullName: "Facilitator",
              isFacilitator: true,
              joinedAt: Date.now(),
            },
          ],
        }),
      },
    );

    expect(start.status).toBe(200);
    expect(start.body.template).toBe("madSadGlad");

    const addMad = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "mad",
          text: "Too many meetings",
        }),
      },
    );

    expect(addMad.status).toBe(200);
    expect(addMad.body.cards?.[0]?.column).toBe("mad");
  });
});
