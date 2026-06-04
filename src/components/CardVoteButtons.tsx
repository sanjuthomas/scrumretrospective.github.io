import type { VoteValue } from "../lib/retroStore";

interface CardVoteButtonsProps {
  cardId: string;
  currentVote: VoteValue | undefined;
  disabled: boolean;
  onVote: (cardId: string, value: VoteValue) => Promise<void>;
}

export function CardVoteButtons({
  cardId,
  currentVote,
  disabled,
  onVote,
}: CardVoteButtonsProps) {
  return (
    <div className="card-vote" role="group" aria-label="Vote on this item">
      <button
        type="button"
        className={`card-vote__btn card-vote__btn--up${
          currentVote === "up" ? " card-vote__btn--selected" : ""
        }`}
        disabled={disabled}
        aria-label={currentVote === "up" ? "Remove upvote" : "Vote up"}
        aria-pressed={currentVote === "up"}
        onClick={() => void onVote(cardId, "up")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
      </button>
      <button
        type="button"
        className={`card-vote__btn card-vote__btn--down${
          currentVote === "down" ? " card-vote__btn--selected" : ""
        }`}
        disabled={disabled}
        aria-label={currentVote === "down" ? "Remove downvote" : "Vote down"}
        aria-pressed={currentVote === "down"}
        onClick={() => void onVote(cardId, "down")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
      </button>
    </div>
  );
}
