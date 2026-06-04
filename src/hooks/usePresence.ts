import { useEffect, useRef } from "react";
import {
  sendPresenceHeartbeat,
  sendPresenceLeave,
} from "../lib/retroApi";

const HEARTBEAT_INTERVAL_MS = 2000;

/**
 * Keeps this participant marked online on the sync server while the session
 * page is mounted. Does not send "leave" on effect cleanup (avoids React
 * Strict Mode and re-render races that were clearing presence immediately).
 */
export function usePresence(
  retroId: string | undefined,
  participantId: string | null,
): void {
  const leaveSentRef = useRef(false);

  useEffect(() => {
    if (!retroId || !participantId) return;

    leaveSentRef.current = false;

    const heartbeat = () => {
      void sendPresenceHeartbeat(retroId, participantId);
    };

    heartbeat();
    const interval = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted || leaveSentRef.current) return;
      leaveSentRef.current = true;
      sendPresenceLeave(retroId, participantId);
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [retroId, participantId]);
}
