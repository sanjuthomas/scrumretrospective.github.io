export interface Participant {
  id: string;
  fullName: string;
  isFacilitator: boolean;
  joinedAt: number;
  online?: boolean;
}

export interface RetroCard {
  id: string;
  column: string;
  text: string;
  authorId: string;
  createdAt: number;
}

export interface RetroResponse {
  id: string;
  name: string;
  createdAt: number;
  template?: string;
  phase?: string;
  participants: Participant[];
  cards?: RetroCard[];
  myVotes?: Record<string, string>;
  cardVoteCounts?: Record<string, { up: number; down: number }>;
}

/** First valid column per template for happy-path card creation. */
export const TEMPLATE_SAMPLE_COLUMNS: Record<string, string> = {
  fourLs: "liked",
  fourWs: "wentWell",
  startStopContinue: "start",
  keepDropTry: "keep",
  daki: "add",
  madSadGlad: "glad",
};

export function createRetroPayload(
  retroId: string,
  overrides: {
    template?: string;
    phase?: string;
    facilitatorId?: string;
    name?: string;
  } = {},
) {
  const facilitatorId = overrides.facilitatorId ?? crypto.randomUUID();
  return {
    id: retroId,
    name: overrides.name ?? "Integration Retro",
    createdAt: Date.now(),
    ...(overrides.template !== undefined ? { template: overrides.template } : {}),
    phase: overrides.phase ?? "assembly",
    cards: [] as RetroCard[],
    participants: [
      {
        id: facilitatorId,
        fullName: "Facilitator",
        isFacilitator: true,
        joinedAt: Date.now(),
      },
    ],
    facilitatorId,
  };
}
