import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { RetroResponse } from "./fixtures";
import { acquireSyncServer, apiJson, type SyncServerHandle } from "./helpers";

let server: SyncServerHandle;

beforeAll(async () => {
  server = await acquireSyncServer();
}, 30_000);

afterAll(async () => {
  await server.stop();
});

async function createTwoParticipantRetro(
  retroId: string,
  facilitatorId: string,
  participantId: string,
  phase = "assembly",
) {
  return apiJson<RetroResponse>(server.apiBase, `/retrospectives/${retroId}`, {
    method: "PUT",
    body: JSON.stringify({
      id: retroId,
      name: "Transfer Test Retro",
      createdAt: Date.now(),
      template: "fourLs",
      phase,
      cards: [],
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
}

describe("facilitator transfer API", () => {
  it("rejects self-transfer and unknown participants", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();
    const participantId = crypto.randomUUID();

    await createTwoParticipantRetro(retroId, facilitatorId, participantId);

    const selfTransfer = await apiJson<{ error?: string }>(
      server.apiBase,
      `/retrospectives/${retroId}/facilitator/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          fromParticipantId: facilitatorId,
          toParticipantId: facilitatorId,
        }),
      },
    );

    expect(selfTransfer.status).toBe(400);
    expect(selfTransfer.body.error).toMatch(/yourself/i);

    const unknownTarget = await apiJson<{ error?: string }>(
      server.apiBase,
      `/retrospectives/${retroId}/facilitator/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          fromParticipantId: facilitatorId,
          toParticipantId: crypto.randomUUID(),
        }),
      },
    );

    expect(unknownTarget.status).toBe(404);
  });

  it("ignores facilitator flag changes on PUT updates", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();
    const participantId = crypto.randomUUID();

    const created = await createTwoParticipantRetro(
      retroId,
      facilitatorId,
      participantId,
    );

    const hijack = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...created.body,
          participants: created.body.participants.map((p) => ({
            ...p,
            isFacilitator: p.id === participantId,
          })),
        }),
      },
    );

    expect(hijack.status).toBe(200);
    expect(
      hijack.body.participants.find((p) => p.id === facilitatorId)?.isFacilitator,
    ).toBe(true);
    expect(
      hijack.body.participants.find((p) => p.id === participantId)?.isFacilitator,
    ).toBe(false);
  });

  it("lets the new facilitator run the session after transfer", async () => {
    const retroId = crypto.randomUUID();
    const facilitatorId = crypto.randomUUID();
    const participantId = crypto.randomUUID();

    const created = await createTwoParticipantRetro(
      retroId,
      facilitatorId,
      participantId,
      "active",
    );
    expect(created.status).toBe(200);

    const transfer = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}/facilitator/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          fromParticipantId: facilitatorId,
          toParticipantId: participantId,
        }),
      },
    );

    expect(transfer.status).toBe(200);
    expect(
      transfer.body.participants.find((p) => p.id === participantId)?.isFacilitator,
    ).toBe(true);

    const openVoting = await apiJson<RetroResponse>(
      server.apiBase,
      `/retrospectives/${retroId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...transfer.body,
          phase: "voting",
        }),
      },
    );

    expect(openVoting.status).toBe(200);
    expect(openVoting.body.phase).toBe("voting");
  });
});
