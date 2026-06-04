import { useEffect, useState } from "react";
import {
  getCachedRetro,
  subscribeRetro,
  type Retrospective,
} from "../lib/retroStore";

export function useRetro(retroId: string | undefined): {
  retro: Retrospective | null;
  loading: boolean;
} {
  const [retro, setRetro] = useState<Retrospective | null>(() =>
    retroId ? getCachedRetro(retroId) : null,
  );
  const [loading, setLoading] = useState(Boolean(retroId));

  useEffect(() => {
    if (!retroId) {
      setRetro(null);
      setLoading(false);
      return;
    }

    return subscribeRetro(retroId, (next, isLoading) => {
      setRetro(next);
      setLoading(isLoading);
    });
  }, [retroId]);

  return { retro, loading };
}
