import type { Participant } from "../lib/retroStore";
import { PresenceIcon } from "./PresenceIcon";

interface ParticipantPaneProps {
  participants: Participant[];
  currentParticipantId: string | null;
  canTransferFacilitator?: boolean;
  transferringParticipantId?: string | null;
  onTransferFacilitator?: (participantId: string) => void;
}

export function ParticipantPane({
  participants,
  currentParticipantId,
  canTransferFacilitator = false,
  transferringParticipantId = null,
  onTransferFacilitator,
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
        {sorted.map((p) => {
          const canMakeFacilitator =
            canTransferFacilitator &&
            p.id !== currentParticipantId &&
            !p.isFacilitator &&
            onTransferFacilitator != null;
          const isTransferring = transferringParticipantId === p.id;

          return (
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
              {canMakeFacilitator && (
                <button
                  type="button"
                  className="participant-pane__transfer-btn"
                  disabled={transferringParticipantId != null}
                  onClick={() => onTransferFacilitator(p.id)}
                  aria-label={`Make ${p.fullName} facilitator`}
                  title={`Make ${p.fullName} facilitator`}
                >
                  {isTransferring ? "Transferring…" : "Make facilitator"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
