import { type FormEvent, useState } from "react";
import type { FourLsColumnDef } from "../lib/fourLs";
import type { Participant, RetroCard } from "../lib/retroStore";
import { Button } from "./Button";

interface FourLsColumnProps {
  column: FourLsColumnDef;
  cards: RetroCard[];
  participantsById: Map<string, Participant>;
  canAdd: boolean;
  onAdd: (text: string) => Promise<void>;
}

export function FourLsColumn({
  column,
  cards,
  participantsById,
  canAdd,
  onAdd,
}: FourLsColumnProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const sortedCards = [...cards].sort((a, b) => a.createdAt - b.createdAt);

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
          return (
            <li key={card.id} className="four-ls-card">
              <p className="four-ls-card__text">{card.text}</p>
              <p className="four-ls-card__meta">
                {author?.fullName ?? "Unknown"}
              </p>
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
