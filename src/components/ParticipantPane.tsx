import type { Participant } from "../lib/retroStore";
import { PresenceIcon } from "./PresenceIcon";

interface ParticipantPaneProps {
  participants: Participant[];
  currentParticipantId: string | null;
}

export function ParticipantPane({
  participants,
  currentParticipantId,
}: ParticipantPaneProps) {
  const sorted = [...participants].sort((a, b) => {
    if (a.isFacilitator !== b.isFacilitator) return a.isFacilitator ? -1 : 1;
    return a.joinedAt - b.joinedAt;
  });

  return (
    <aside className="participant-pane">
      <h2 className="participant-pane__title">Participants</h2>
      <p className="participant-pane__count">{participants.length}</p>
      <ul className="participant-pane__list">
        {sorted.map((p) => (
          <li
            key={p.id}
            className={`participant-pane__item${
              p.id === currentParticipantId
                ? " participant-pane__item--you"
                : ""
            }`}
          >
            <div className="participant-pane__row">
              <PresenceIcon online={Boolean(p.online)} />
              <span className="participant-pane__name">{p.fullName}</span>
            </div>
            {p.isFacilitator && (
              <span className="participant-pane__badge">Facilitator</span>
            )}
            {p.id === currentParticipantId && (
              <span className="participant-pane__badge participant-pane__badge--you">
                You
              </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
