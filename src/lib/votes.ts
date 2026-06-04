export interface CardVoteCounts {
  up: number;
  down: number;
}

export function effectiveVote(counts: CardVoteCounts | undefined): number {
  return (counts?.up ?? 0) - (counts?.down ?? 0);
}
