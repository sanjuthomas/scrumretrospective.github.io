import { type FormEvent, useMemo, useState } from "react";
import type { RetroColumnDef } from "../lib/templates";
import type {
  Participant,
  RetroCard,
  VoteValue,
} from "../lib/retroStore";
import type { CardVoteCounts as CardVoteCountsType } from "../lib/votes";
import { sortCardsForResults } from "../lib/sortCards";
import { Button } from "./Button";
import { CardVoteButtons } from "./CardVoteButtons";
import { CardVoteCounts } from "./CardVoteCounts";

interface RetroColumnProps {
  column: RetroColumnDef;
  cards: RetroCard[];
  participantsById: Map<string, Participant>;
  canAdd: boolean;
  canVote: boolean;
  showResults: boolean;
  currentParticipantId: string | null;
  myVotes: Partial<Record<string, VoteValue>>;
  cardVoteCounts: Partial<Record<string, CardVoteCountsType>>;
  onAdd: (text: string) => Promise<void>;
  onVote: (cardId: string, value: VoteValue) => Promise<void>;
}

export function RetroColumn({
  column,
  cards,
  participantsById,
  canAdd,
  canVote,
  showResults,
  currentParticipantId,
  myVotes,
  cardVoteCounts,
  onAdd,
  onVote,
}: RetroColumnProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votingCardId, setVotingCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting || !canAdd) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(cardId: string, value: VoteValue) {
    if (!canVote || votingCardId) return;
    setVotingCardId(cardId);
    setError(null);
    try {
      await onVote(cardId, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record vote.");
    } finally {
      setVotingCardId(null);
    }
  }

  const sortedCards = useMemo(() => {
    if (showResults) {
      return sortCardsForResults(cards, column.id, cardVoteCounts);
    }
    return [...cards].sort((a, b) => a.createdAt - b.createdAt);
  }, [cards, column.id, showResults, cardVoteCounts]);

  return (
    <section className="four-ls-column" aria-labelledby={`column-${column.id}`}>
      <header className="four-ls-column__header">
        <h2 className="four-ls-column__title" id={`column-${column.id}`}>
          {column.title}
        </h2>
        <p className="four-ls-column__prompt">{column.prompt}</p>
      </header>

      <ul className="four-ls-column__cards">
        {sortedCards.map((card) => {
          const author = participantsById.get(card.authorId);
          const isOwnCard =
            currentParticipantId != null && card.authorId === currentParticipantId;
          const showVoteButtons = canVote && !isOwnCard;
          const counts = cardVoteCounts[card.id] ?? { up: 0, down: 0 };

          return (
            <li key={card.id} className="four-ls-card">
              <div className="four-ls-card__content">
                <p className="four-ls-card__text">{card.text}</p>
                <p className="four-ls-card__meta">
                  {author?.fullName ?? "Unknown"}
                </p>
              </div>
              {showVoteButtons && (
                <CardVoteButtons
                  cardId={card.id}
                  currentVote={myVotes[card.id]}
                  disabled={votingCardId === card.id}
                  onVote={handleVote}
                />
              )}
              {showResults && <CardVoteCounts counts={counts} />}
            </li>
          );
        })}
      </ul>

      {canAdd && (
        <form className="four-ls-column__form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor={`add-${column.id}`}>
            Add to {column.title}
          </label>
          <textarea
            id={`add-${column.id}`}
            className="four-ls-column__input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add to ${column.title}…`}
            rows={3}
            disabled={submitting}
          />
          {error && <p className="error-text four-ls-column__error">{error}</p>}
          <Button
            type="submit"
            variant="secondary"
            className="four-ls-column__submit"
            disabled={!text.trim() || submitting}
          >
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
      )}
    </section>
  );
}
