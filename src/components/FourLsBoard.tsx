import { FOUR_LS_COLUMNS } from "../lib/fourLs";
import { addCard, type FourLsColumn, type Retrospective } from "../lib/retroStore";
import { FourLsColumn as FourLsColumnView } from "./FourLsColumn";

interface FourLsBoardProps {
  retro: Retrospective;
  retroId: string;
  currentParticipantId: string | null;
}

export function FourLsBoard({
  retro,
  retroId,
  currentParticipantId,
}: FourLsBoardProps) {
  const cards = retro.cards ?? [];
  const canAdd = Boolean(currentParticipantId);
  const participantsById = new Map(
    retro.participants.map((p) => [p.id, p]),
  );

  async function handleAdd(column: FourLsColumn, text: string) {
    if (!currentParticipantId) {
      throw new Error("Join the retrospective to add items.");
    }
    const updated = await addCard(
      retroId,
      currentParticipantId,
      column,
      text,
    );
    if (!updated) {
      throw new Error("Could not add item. Is the sync server running?");
    }
  }

  return (
    <section className="four-ls-board" aria-label="4Ls retrospective board">
      <header className="four-ls-board__header">
        <h2 className="four-ls-board__title">4Ls Retrospective</h2>
        <p className="four-ls-board__subtitle">
          {canAdd
            ? "Add items to any column. Everyone sees updates in real time."
            : "Join the retrospective to add items to the board."}
        </p>
      </header>
      <div className="four-ls-board__columns">
        {FOUR_LS_COLUMNS.map((column) => (
          <FourLsColumnView
            key={column.id}
            column={column}
            cards={cards.filter((c) => c.column === column.id)}
            participantsById={participantsById}
            canAdd={canAdd}
            onAdd={(text) => handleAdd(column.id, text)}
          />
        ))}
      </div>
    </section>
  );
}
