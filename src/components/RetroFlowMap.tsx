const PHASES = [
  {
    number: 1,
    name: "Team Assembly",
    tone: "assembly",
    facilitator: ["Create retro", "Copy join link", "Start retrospective"],
    participant: ["Open join link", "Enter name", "Wait for facilitator"],
  },
  {
    number: 2,
    name: "Retrospective",
    tone: "active",
    facilitator: ["Add 4L items", "Start voting"],
    participant: ["Add 4L items to board"],
  },
  {
    number: 3,
    name: "Voting",
    tone: "voting",
    facilitator: ["Vote on others' items", "Close voting"],
    participant: ["Vote up/down (not on own items)"],
  },
  {
    number: 4,
    name: "Results",
    tone: "results",
    facilitator: ["Review results", "End retro & export PDF"],
    participant: ["View ranked results"],
  },
] as const;

function PersonIcon() {
  return (
    <svg
      className="retro-flow__person"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <circle cx="24" cy="14" r="8" fill="currentColor" opacity="0.9" />
      <path
        d="M8 42c0-9.5 7.2-14 16-14s16 4.5 16 14"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M14 20c2-4 6-6 10-6s8 2 10 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function PhaseIcon({ tone }: { tone: (typeof PHASES)[number]["tone"] }) {
  switch (tone) {
    case "assembly":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="11" cy="12" r="4" fill="currentColor" />
          <circle cx="21" cy="12" r="4" fill="currentColor" />
          <path
            d="M6 24c0-4 3-6 5-6s3 2 5 2 3-2 5-2 5 2 5 6"
            fill="currentColor"
          />
        </svg>
      );
    case "active":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect x="5" y="6" width="22" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="8" y="10" width="7" height="5" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="17" y="10" width="7" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="8" y="18" width="7" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="17" y="18" width="7" height="5" rx="1" fill="currentColor" opacity="0.7" />
        </svg>
      );
    case "voting":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M10 8h12l-2 14H12L10 8z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M13 26h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "results":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect x="6" y="18" width="5" height="8" rx="1" fill="currentColor" opacity="0.55" />
          <rect x="13.5" y="12" width="5" height="14" rx="1" fill="currentColor" opacity="0.75" />
          <rect x="21" y="8" width="5" height="18" rx="1" fill="currentColor" />
          <path
            d="M6 8l4 3 5-6 5 4 6-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function ActionList({ items }: { items: readonly string[] }) {
  return (
    <ul className="retro-flow__actions">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function RetroFlowMap() {
  return (
    <section className="retro-flow" aria-label="How a retrospective works">
      <h2 className="retro-flow__heading">How it works</h2>
      <div className="retro-flow__scroll">
        <div className="retro-flow__grid">
          <div className="retro-flow__corner" aria-hidden="true" />

          {PHASES.map((phase, index) => (
            <div
              key={phase.number}
              className={`retro-flow__phase-header retro-flow__phase-header--${phase.tone}`}
            >
              <span className="retro-flow__phase-icon">
                <PhaseIcon tone={phase.tone} />
              </span>
              <div className="retro-flow__phase-copy">
                <span className="retro-flow__phase-label">
                  Phase {phase.number}
                </span>
                <span className="retro-flow__phase-name">{phase.name}</span>
              </div>
              {index < PHASES.length - 1 && (
                <span className="retro-flow__arrow" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}

          <div className="retro-flow__lane-label retro-flow__lane-label--facilitator">
            <PersonIcon />
            <span>Facilitator</span>
          </div>

          {PHASES.map((phase) => (
            <div
              key={`facilitator-${phase.number}`}
              className={`retro-flow__cell retro-flow__cell--${phase.tone}`}
            >
              <ActionList items={phase.facilitator} />
            </div>
          ))}

          <div className="retro-flow__lane-label retro-flow__lane-label--participant">
            <PersonIcon />
            <span>Participant</span>
          </div>

          {PHASES.map((phase) => (
            <div
              key={`participant-${phase.number}`}
              className={`retro-flow__cell retro-flow__cell--${phase.tone}`}
            >
              <ActionList items={phase.participant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
