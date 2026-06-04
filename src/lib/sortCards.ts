import type { FourLsColumn, RetroCard } from "./retroStore";
import type { CardVoteCounts } from "./votes";
import { effectiveVote } from "./votes";

export function sortCardsForResults(
  cards: RetroCard[],
  column: FourLsColumn,
  cardVoteCounts: Partial<Record<string, CardVoteCounts>>,
): RetroCard[] {
  return cards
    .filter((card) => card.column === column)
    .sort((a, b) => {
      const scoreDiff =
        effectiveVote(cardVoteCounts[b.id]) -
        effectiveVote(cardVoteCounts[a.id]);
      if (scoreDiff !== 0) return scoreDiff;
      return a.createdAt - b.createdAt;
    });
}
