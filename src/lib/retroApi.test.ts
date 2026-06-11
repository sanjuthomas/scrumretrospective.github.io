import { afterEach, describe, expect, it, vi } from "vitest";
import type { Retrospective } from "./retroStore";

const retro: Retrospective = {
  id: "retro-1",
  name: "MSG Retro",
  createdAt: 1,
  template: "madSadGlad",
  phase: "active",
  participants: [
    {
      id: "p1",
      fullName: "Facilitator",
      isFacilitator: true,
      joinedAt: 1,
      online: true,
      lastSeen: 99,
    },
  ],
  cards: [],
};

describe("fetchRetro", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null for 404 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 404, ok: false }),
    );

    const { fetchRetro } = await import("./retroApi");
    await expect(fetchRetro("missing")).resolves.toBeNull();
  });

  it("returns normalized participants and template", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          ...retro,
          participants: [
            {
              id: "p1",
              fullName: "Facilitator",
              isInitiator: true,
              joinedAt: 1,
            },
          ],
        }),
      }),
    );

    const { fetchRetro } = await import("./retroApi");
    const result = await fetchRetro("retro-1", "p1");

    expect(fetch).toHaveBeenCalledWith("/api/retrospectives/retro-1?participantId=p1");
    expect(result?.participants[0]?.isFacilitator).toBe(true);
    expect(result?.template).toBe("madSadGlad");
  });

  it("returns null when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { fetchRetro } = await import("./retroApi");
    await expect(fetchRetro("retro-1")).resolves.toBeNull();
  });

  it("returns null for non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const { fetchRetro } = await import("./retroApi");
    await expect(fetchRetro("retro-1")).resolves.toBeNull();
  });
});

describe("saveRetro", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the retrospective template when present", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => retro,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { saveRetro } = await import("./retroApi");
    await saveRetro(retro);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Retrospective;

    expect(payload.template).toBe("madSadGlad");
    expect(payload.participants[0]).not.toHaveProperty("online");
    expect(payload.participants[0]).not.toHaveProperty("lastSeen");
  });

  it("omits template from the payload when absent so the server can preserve it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...retro, template: "madSadGlad" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { saveRetro } = await import("./retroApi");
    const { template: _template, ...withoutTemplate } = retro;
    await saveRetro(withoutTemplate);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Retrospective;

    expect(payload.template).toBeUndefined();
  });

  it("returns null when save fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const { saveRetro } = await import("./retroApi");
    await expect(saveRetro(retro)).resolves.toBeNull();
  });
});

describe("addRetroCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts Mad Sad Glad column ids to the sync API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...retro,
        cards: [
          {
            id: "card-1",
            column: "sad",
            text: "Missed deadline",
            authorId: "p1",
            createdAt: 2,
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { addRetroCard } = await import("./retroApi");
    await addRetroCard("retro-1", {
      participantId: "p1",
      column: "sad",
      text: "Missed deadline",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as {
      column: string;
      text: string;
    };

    expect(payload.column).toBe("sad");
    expect(payload.text).toBe("Missed deadline");
  });

  it("returns null for missing retrospectives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 404, ok: false }),
    );

    const { addRetroCard } = await import("./retroApi");
    await expect(
      addRetroCard("missing", {
        participantId: "p1",
        column: "sad",
        text: "Oops",
      }),
    ).resolves.toBeNull();
  });

  it("throws API errors with server messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid column" }),
      }),
    );

    const { addRetroCard } = await import("./retroApi");
    await expect(
      addRetroCard("retro-1", {
        participantId: "p1",
        column: "sad",
        text: "Missed deadline",
      }),
    ).rejects.toThrow("Invalid column");
  });
});

describe("castRetroVote", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts vote payloads to the sync API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => retro,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { castRetroVote } = await import("./retroApi");
    await castRetroVote("retro-1", {
      participantId: "p1",
      cardId: "card-1",
      value: "up",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      participantId: "p1",
      cardId: "card-1",
      value: "up",
    });
  });

  it("returns null for missing retrospectives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 404, ok: false }),
    );

    const { castRetroVote } = await import("./retroApi");
    await expect(
      castRetroVote("retro-1", {
        participantId: "p1",
        cardId: "card-1",
        value: "down",
      }),
    ).resolves.toBeNull();
  });

  it("throws vote failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => null,
      }),
    );

    const { castRetroVote } = await import("./retroApi");
    await expect(
      castRetroVote("retro-1", {
        participantId: "p1",
        cardId: "card-1",
        value: "down",
      }),
    ).rejects.toThrow("vote failed: 409");
  });
});

describe("presence and delete helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends presence heartbeats", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true }),
    );

    const { sendPresenceHeartbeat } = await import("./retroApi");
    await expect(sendPresenceHeartbeat("retro-1", "p1")).resolves.toBe(true);
  });

  it("returns false when heartbeat fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { sendPresenceHeartbeat } = await import("./retroApi");
    await expect(sendPresenceHeartbeat("retro-1", "p1")).resolves.toBe(false);
  });

  it("deletes retrospectives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true }),
    );

    const { deleteRetro } = await import("./retroApi");
    await expect(deleteRetro("retro-1")).resolves.toBe(true);
  });

  it("returns false when delete fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false }),
    );

    const { deleteRetro } = await import("./retroApi");
    await expect(deleteRetro("retro-1")).resolves.toBe(false);
  });

  it("uses sendBeacon for presence leave when available", async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { sendBeacon });

    const { sendPresenceLeave } = await import("./retroApi");
    sendPresenceLeave("retro-1", "p1");

    expect(sendBeacon).toHaveBeenCalled();
  });

  it("falls back to fetch when sendBeacon is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", {});

    const { sendPresenceLeave } = await import("./retroApi");
    sendPresenceLeave("retro-1", "p1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/retrospectives/retro-1/presence/leave",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
  });
});
