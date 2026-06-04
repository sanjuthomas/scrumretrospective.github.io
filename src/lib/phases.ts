import type { RetroPhase } from "./retroStore";

export function getPhaseLabel(phase: RetroPhase | undefined): string {
  switch (phase ?? "assembly") {
    case "assembly":
      return "Phase 1 — Team assembly";
    case "active":
      return "Phase 2 — Retrospective";
    case "voting":
      return "Phase 3 — Voting";
    case "results":
      return "Phase 4 — Results";
  }
}
