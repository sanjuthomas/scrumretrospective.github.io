import { jsPDF } from "jspdf";
import { FOUR_LS_COLUMNS } from "./fourLs";
import { formatDuration, formatRetroCreatedAt } from "./formatDate";
import { sortCardsForResults } from "./sortCards";
import type { Retrospective } from "./retroStore";
import { effectiveVote } from "./votes";

const PAGE_MARGIN = 20;
const LINE_HEIGHT = 6;
const PAGE_BOTTOM = 280;

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "retro";
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= PAGE_BOTTOM) return y;
  doc.addPage();
  return PAGE_MARGIN;
}

function writeLines(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(line, x, y);
    y += LINE_HEIGHT;
  }
  return y;
}

export function downloadRetroPdf(retro: Retrospective, endedAt = Date.now()): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const cardVoteCounts = retro.cardVoteCounts ?? {};
  const participantsById = new Map(
    retro.participants.map((p) => [p.id, p.fullName]),
  );
  const facilitator = retro.participants.find((p) => p.isFacilitator);
  const sortedParticipants = [...retro.participants].sort((a, b) => {
    if (a.isFacilitator !== b.isFacilitator) return a.isFacilitator ? -1 : 1;
    return a.joinedAt - b.joinedAt;
  });

  let y = PAGE_MARGIN;

  doc.setFont("helvetica", "bold");
  y = writeLines(doc, retro.name, PAGE_MARGIN, y, contentWidth, 18);
  y += 4;

  doc.setFont("helvetica", "normal");
  y = writeLines(
    doc,
    `Facilitator: ${facilitator?.fullName ?? "Unknown"}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    11,
  );
  y = writeLines(
    doc,
    `Started: ${formatRetroCreatedAt(retro.createdAt)}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    11,
  );
  y = writeLines(
    doc,
    `Ended: ${formatRetroCreatedAt(endedAt)}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    11,
  );
  y = writeLines(
    doc,
    `Duration: ${formatDuration(endedAt - retro.createdAt)}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    11,
  );
  y += 2;

  y = writeLines(doc, "Participants", PAGE_MARGIN, y, contentWidth, 12);
  doc.setFont("helvetica", "normal");
  for (const participant of sortedParticipants) {
    const label = participant.isFacilitator
      ? `${participant.fullName} (Facilitator)`
      : participant.fullName;
    y = writeLines(doc, `• ${label}`, PAGE_MARGIN + 4, y, contentWidth - 4, 10);
  }
  y += 6;

  const cards = retro.cards ?? [];

  for (const column of FOUR_LS_COLUMNS) {
    y = ensureSpace(doc, y, LINE_HEIGHT * 3);
    doc.setFont("helvetica", "bold");
    y = writeLines(doc, column.title, PAGE_MARGIN, y, contentWidth, 14);
    doc.setFont("helvetica", "italic");
    y = writeLines(doc, column.prompt, PAGE_MARGIN, y, contentWidth, 9);
    doc.setFont("helvetica", "normal");
    y += 2;

    const columnCards = sortCardsForResults(cards, column.id, cardVoteCounts);

    if (columnCards.length === 0) {
      y = writeLines(
        doc,
        "No items recorded.",
        PAGE_MARGIN + 4,
        y,
        contentWidth - 4,
        10,
      );
      y += 4;
      continue;
    }

    for (const card of columnCards) {
      const counts = cardVoteCounts[card.id];
      const author = participantsById.get(card.authorId) ?? "Unknown";
      const net = effectiveVote(counts);

      y = ensureSpace(doc, y, LINE_HEIGHT * 4);
      y = writeLines(
        doc,
        card.text,
        PAGE_MARGIN + 4,
        y,
        contentWidth - 4,
        10,
      );
      y = writeLines(
        doc,
        `— ${author}  |  Net vote: ${net >= 0 ? "+" : ""}${net}`,
        PAGE_MARGIN + 4,
        y,
        contentWidth - 4,
        9,
      );
      y += 3;
    }
    y += 4;
  }

  doc.save(`${sanitizeFilename(retro.name)}-retro.pdf`);
}
