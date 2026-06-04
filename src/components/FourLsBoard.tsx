import { FOUR_LS_COLUMNS } from "../lib/fourLs";
import {
  addCard,
  castVote,
  type FourLsColumn,
  type Retrospective,
  type RetroPhase,
  type VoteValue,
} from "../lib/retroStore";
import { FourLsColumn as FourLsColumnView } from "./FourLsColumn";

interface FourLsBoardProps {
  retro: Retrospective;
  retroId: string;
  phase: RetroPhase;
  currentParticipantId: string | null;
}

export function FourLsBoard({
  retro,
  retroId,
  phase,
  currentParticipantId,
}: FourLsBoardProps) {
  const cards = retro.cards ?? [];
  const isActive = phase === "active";
  const isVoting = phase === "voting";
  const isResults = phase === "results";
  const canAdd = isActive && Boolean(currentParticipantId);
  const canVote = isVoting && Boolean(currentParticipantId);
  const showResults = isResults;
  const myVotes = retro.myVotes ?? {};
  const cardVoteCounts = retro.cardVoteCounts ?? {};
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

  async function handleVote(cardId: string, value: VoteValue) {
    if (!currentParticipantId) {
      throw new Error("Join the retrospective to vote.");
    }
    const updated = await castVote(
      retroId,
      currentParticipantId,
      cardId,
      value,
    );
    if (!updated) {
      throw new Error("Could not record vote. Is the sync server running?");
    }
  }

  let subtitle = "Join the retrospective to add items to the board.";
  if (canAdd) {
    subtitle = "Add items to any column. Everyone sees updates in real time.";
  } else if (isVoting && canVote) {
    subtitle =
      "Vote on items from other participants. Vote counts stay hidden during this phase.";
  } else if (isVoting) {
    subtitle = "Voting is in progress. Join to cast your votes.";
  } else if (isResults) {
    subtitle =
      "Voting is closed. Items are sorted by net votes (up minus down) in each column.";
  }

  return (
    <section className="four-ls-board" aria-label="4Ls retrospective board">
      <header className="four-ls-board__header">
        <h2 className="four-ls-board__title">4Ls Retrospective</h2>
        <p className="four-ls-board__subtitle">{subtitle}</p>
      </header>
      <div className="four-ls-board__columns">
        {FOUR_LS_COLUMNS.map((column) => (
          <FourLsColumnView
            key={column.id}
            column={column}
            cards={cards.filter((c) => c.column === column.id)}
            participantsById={participantsById}
            canAdd={canAdd}
            canVote={canVote}
            showResults={showResults}
            currentParticipantId={currentParticipantId}
            myVotes={myVotes}
            cardVoteCounts={cardVoteCounts}
            onAdd={(text) => handleAdd(column.id, text)}
            onVote={handleVote}
          />
        ))}
      </div>
    </section>
  );
}
