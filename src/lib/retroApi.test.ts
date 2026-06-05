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
    },
  ],
  cards: [],
};

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
});
