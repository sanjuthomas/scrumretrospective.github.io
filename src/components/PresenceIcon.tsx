interface PresenceIconProps {
  online: boolean;
}

export function PresenceIcon({ online }: PresenceIconProps) {
  if (online) {
    return (
      <span
        className="presence-icon presence-icon--online"
        title="Online"
        aria-label="Online"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
          <path
            d="M7 12.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="presence-icon presence-icon--offline"
      title="Offline"
      aria-label="Offline"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
