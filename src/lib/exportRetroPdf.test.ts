import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Retrospective } from "./retroStore";

const save = vi.fn();

vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    splitTextToSize: (text: string) => [text],
    text: vi.fn(),
    addPage: vi.fn(),
    save,
  })),
}));

describe("downloadRetroPdf", () => {
  beforeEach(() => {
    save.mockClear();
  });

  it("exports anonymized results without participant names", async () => {
    const { downloadRetroPdf } = await import("./exportRetroPdf");

    const retro: Retrospective = {
      id: "retro-1",
      name: "Sprint 42 Retro",
      createdAt: Date.UTC(2026, 5, 4, 10, 0),
      phase: "results",
      participants: [
        {
          id: "fac-1",
          fullName: "Jane Facilitator",
          isFacilitator: true,
          joinedAt: 1,
        },
      ],
      cards: [
        {
          id: "card-1",
          column: "liked",
          text: "Great collaboration",
          authorId: "fac-1",
          createdAt: 2,
        },
      ],
      cardVoteCounts: {
        "card-1": { up: 3, down: 1 },
      },
    };

    downloadRetroPdf(retro, Date.UTC(2026, 5, 4, 11, 0));

    expect(save).toHaveBeenCalledWith("Sprint-42-Retro-retro.pdf");

    const { jsPDF } = await import("jspdf");
    const doc = vi.mocked(jsPDF).mock.results.at(-1)?.value;
    const writtenText = vi
      .mocked(doc.text)
      .mock.calls.map((call: unknown[]) => String(call[0]))
      .join("\n");

    expect(writtenText).toContain("Sprint 42 Retro");
    expect(writtenText).toContain("Great collaboration");
    expect(writtenText).toContain("Net vote: +2");
    expect(writtenText).not.toContain("Jane Facilitator");
    expect(writtenText).not.toContain("Participants");
  });
});
