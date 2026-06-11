import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createRetroPayload,
  TEMPLATE_SAMPLE_COLUMNS,
  type RetroResponse,
} from "./fixtures";
import { acquireSyncServer, apiJson, type SyncServerHandle } from "./helpers";

let server: SyncServerHandle;

beforeAll(async () => {
  server = await acquireSyncServer();
}, 30_000);

afterAll(async () => {
  await server.stop();
});

describe("sync API happy paths", () => {
  it("returns health status", async () => {
    const health = await apiJson<{ ok: boolean }>(server.apiBase, "/health");
    expect(health.status).toBe(200);
    expect(health.body.ok).toBe(true);
  });

  it("defaults new retrospectives to the 4 Ls template", async () => {
    const retroId = crypto.randomUUID();
    const { facilitatorId, ...payload } = createRetroPayload(retroId);

    const create = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );

    expect(create.status).toBe(200);
    expect(create.body.template).toBe("fourLs");

    const active = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({ ...create.body, phase: "active" }),
      },
    );

    const card = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "liked",
          text: "Default template works",
        }),
      },
    );

    expect(active.status).toBe(200);
    expect(card.status).toBe(200);
    expect(card.body.cards?.[0]?.column).toBe("liked");
  });

  it.each(Object.entries(TEMPLATE_SAMPLE_COLUMNS))(
    "accepts cards for the %s template",
    async (template, column) => {
      const retroId = crypto.randomUUID();
      const { facilitatorId, ...payload } = createRetroPayload(retroId, {
        template,
        phase: "active",
      });

      await apiJson<RetroResponse>(server.apiBase, `/retrospectives/${retroId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const card = await apiJson<RetroResponse>(
        server.apiBase,
        `/retrospectives/${retroId}/cards`,
        {
          method: "POST",
          body: JSON.stringify({
            participantId: facilitatorId,
            column,
            text: `${template} column`,
          }),
        },
      );

      expect(card.status).toBe(200);
      expect(card.body.template).toBe(template);
      expect(card.body.cards?.[0]?.column).toBe(column);
    },
  );

  it("marks participants online after heartbeat and offline after leave", async () => {
    const retroId = crypto.randomUUID();
    const participantId = crypto.randomUUID();
    const { facilitatorId, ...payload } = createRetroPayload(retroId, {
      facilitatorId: crypto.randomUUID(),
    });

    await apiJson<RetroResponse>(server.apiBase, `/retrospectives/${retroId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...payload,
        participants: [
          ...payload.participants,
          {
            id: participantId,
            fullName: "Participant",
            isFacilitator: false,
            joinedAt: Date.now(),
          },
        ],
      }),
    });

    const heartbeat = await apiJson<{ ok: boolean }>(
      server.apiBase,
      `/retrospectives/${retroId}/presence`,
      {
        method: "POST",
        body: JSON.stringify({ participantId }),
      },
    );

    expect(heartbeat.status).toBe(200);
    expect(heartbeat.body.ok).toBe(true);

    const online = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
    );

    expect(online.body.participants.find((p) => p.id === participantId)?.online).toBe(
      true,
    );

    const leave = await apiJson<{ ok: boolean }>(
      server.apiBase,
      `/retrospectives/${retroId}/presence/leave`,
      {
        method: "POST",
        body: JSON.stringify({ participantId }),
      },
    );

    expect(leave.status).toBe(200);
    expect(leave.body.ok).toBe(true);

    const offline = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
    );

    expect(offline.body.participants.find((p) => p.id === participantId)?.online).toBe(
      false,
    );

    void facilitatorId;
  });

  it("supports downvotes, vote changes, and removing a vote", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();
    const participantId = crypto.randomUUID();

    const { facilitatorId: _fac, ...retroBase } = createRetroPayload(retroId, {
      template: "fourLs",
      phase: "active",
      facilitatorId,
    });

    await apiJson<RetroResponse>(server.apiBase, `/retrospectives/${retroId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...retroBase,
        participants: [
          {
            id: facilitatorId,
            fullName: "Facilitator",
            isFacilitator: true,
            joinedAt: Date.now(),
          },
          {
            id: participantId,
            fullName: "Participant",
            isFacilitator: false,
            joinedAt: Date.now(),
          },
        ],
      }),
    });

    const facilitatorCard = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          column: "liked",
          text: "Facilitator item",
        }),
      },
    );

    const participantCard = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/cards`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId,
          column: "learned",
          text: "Participant item",
        }),
      },
    );

    const facilitatorCardId = facilitatorCard.body.cards?.find(
      (card) => card.authorId === facilitatorId,
    )?.id;
    const participantCardId = participantCard.body.cards?.find(
      (card) => card.authorId === participantId,
    )?.id;

    expect(facilitatorCardId).toBeTruthy();
    expect(participantCardId).toBeTruthy();

    await apiJson<RetroResponse>(server.apiBase, `/retrospectives/${retroId}`, {
      method: "PUT",
      body: JSON.stringify({ ...participantCard.body, phase: "voting" }),
    });

    const downvote = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/votes`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId,
          cardId: facilitatorCardId,
          value: "down",
        }),
      },
    );

    expect(downvote.status).toBe(200);
    expect(downvote.body.myVotes?.[facilitatorCardId!]).toBe("down");

    const changeVote = await apiJson<RetroResponse>(
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

    expect(changeVote.status).toBe(200);
    expect(changeVote.body.myVotes?.[facilitatorCardId!]).toBe("up");

    const facilitatorVotesParticipant = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/votes`,
      {
        method: "POST",
        body: JSON.stringify({
          participantId: facilitatorId,
          cardId: participantCardId,
          value: "down",
        }),
      },
    );

    expect(facilitatorVotesParticipant.status).toBe(200);
    expect(facilitatorVotesParticipant.body.myVotes?.[participantCardId!]).toBe(
      "down",
    );

    const removeVote = await apiJson<RetroResponse>(
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

    expect(removeVote.status).toBe(200);
    expect(removeVote.body.myVotes?.[facilitatorCardId!]).toBeUndefined();

    const results = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({ ...removeVote.body, phase: "results" }),
      },
    );

    expect(results.status).toBe(200);
    expect(results.body.cardVoteCounts?.[facilitatorCardId!]).toBeUndefined();
    expect(results.body.cardVoteCounts?.[participantCardId!]).toEqual({
      up: 0,
      down: 1,
    });

    const participantView = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}?participantId=${participantId}`,
    );

    expect(participantView.status).toBe(200);
    expect(participantView.body.cardVoteCounts?.[participantCardId!]).toEqual({
      up: 0,
      down: 1,
    });
  });

  it("returns a retrospective with GET after creation", async () => {
    const retroId = crypto.randomUUID();
    const { facilitatorId, ...payload } = createRetroPayload(retroId, {
      name: "Fetched Retro",
    });

    const create = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );

    const fetched = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}?participantId=${facilitatorId}`,
    );

    expect(create.status).toBe(200);
    expect(fetched.status).toBe(200);
    expect(fetched.body.name).toBe("Fetched Retro");
    expect(fetched.body.participants[0]?.id).toBe(facilitatorId);
  });
});
