export type RetroTemplate =
  | "fourLs"
  | "madSadGlad"
  | "fourWs"
  | "startStopContinue"
  | "keepDropTry"
  | "daki";

export type FourLsColumnId = "liked" | "learned" | "lacked" | "longedFor";
export type MadSadGladColumnId = "mad" | "sad" | "glad";
export type FourWsColumnId =
  | "wentWell"
  | "didNotGoWell"
  | "learned"
  | "shouldChange";
export type StartStopContinueColumnId = "start" | "stop" | "continue";
export type KeepDropTryColumnId = "keep" | "drop" | "try";
export type DakiColumnId = "drop" | "add" | "keep" | "improve";
export type RetroColumnId =
  | FourLsColumnId
  | MadSadGladColumnId
  | FourWsColumnId
  | StartStopContinueColumnId
  | KeepDropTryColumnId
  | DakiColumnId;

export interface RetroColumnDef {
  id: RetroColumnId;
  title: string;
  prompt: string;
}

export interface RetroTemplateDef {
  id: RetroTemplate;
  label: string;
  description: string;
  boardTitle: string;
  columns: RetroColumnDef[];
}

export const FOUR_LS_TEMPLATE: RetroTemplateDef = {
  id: "fourLs",
  label: "4 Ls",
  description: "Liked, Learned, Lacked, Longed For",
  boardTitle: "4 Ls Retrospective",
  columns: [
    {
      id: "liked",
      title: "Liked",
      prompt: "What went well this sprint?",
    },
    {
      id: "learned",
      title: "Learned",
      prompt: "What did the team discover?",
    },
    {
      id: "lacked",
      title: "Lacked",
      prompt: "What was missing or insufficient?",
    },
    {
      id: "longedFor",
      title: "Longed For",
      prompt: "What do you wish had happened?",
    },
  ],
};

export const FOUR_WS_TEMPLATE: RetroTemplateDef = {
  id: "fourWs",
  label: "4 Ws",
  description: "Went well, didn't go well, learned, should change",
  boardTitle: "4 Ws Retrospective",
  columns: [
    {
      id: "wentWell",
      title: "Went Well",
      prompt: "What went well?",
    },
    {
      id: "didNotGoWell",
      title: "Did Not Go Well",
      prompt: "What did not go well?",
    },
    {
      id: "learned",
      title: "Learned",
      prompt: "What did we learn?",
    },
    {
      id: "shouldChange",
      title: "Should Change",
      prompt: "What should we change before the next cycle?",
    },
  ],
};

export const START_STOP_CONTINUE_TEMPLATE: RetroTemplateDef = {
  id: "startStopContinue",
  label: "Start, Stop, Continue",
  description: "New habits, habits to drop, and what to keep",
  boardTitle: "Start, Stop, Continue Retrospective",
  columns: [
    {
      id: "start",
      title: "Start",
      prompt: "What should we start doing?",
    },
    {
      id: "stop",
      title: "Stop",
      prompt: "What should we stop doing?",
    },
    {
      id: "continue",
      title: "Continue",
      prompt: "What should we keep doing?",
    },
  ],
};

export const KEEP_DROP_TRY_TEMPLATE: RetroTemplateDef = {
  id: "keepDropTry",
  label: "Keep, Drop, Try",
  description: "Keep what works, drop what doesn't, try something new",
  boardTitle: "Keep, Drop, Try Retrospective",
  columns: [
    {
      id: "keep",
      title: "Keep",
      prompt: "What should we keep doing?",
    },
    {
      id: "drop",
      title: "Drop",
      prompt: "What should we drop?",
    },
    {
      id: "try",
      title: "Try",
      prompt: "What should we try?",
    },
  ],
};

export const DAKI_TEMPLATE: RetroTemplateDef = {
  id: "daki",
  label: "DAKI",
  description: "Drop, Add, Keep, Improve",
  boardTitle: "DAKI Retrospective",
  columns: [
    {
      id: "drop",
      title: "Drop",
      prompt: "What should we drop?",
    },
    {
      id: "add",
      title: "Add",
      prompt: "What should we add?",
    },
    {
      id: "keep",
      title: "Keep",
      prompt: "What should we keep?",
    },
    {
      id: "improve",
      title: "Improve",
      prompt: "What should we improve?",
    },
  ],
};

export const MAD_SAD_GLAD_TEMPLATE: RetroTemplateDef = {
  id: "madSadGlad",
  label: "Mad, Sad, Glad",
  description: "Share frustrations, disappointments, and wins",
  boardTitle: "Mad, Sad, Glad Retrospective",
  columns: [
    {
      id: "mad",
      title: "Mad",
      prompt: "What made you angry or frustrated?",
    },
    {
      id: "sad",
      title: "Sad",
      prompt: "What disappointed or drained you?",
    },
    {
      id: "glad",
      title: "Glad",
      prompt: "What made you happy or proud?",
    },
  ],
};

export const RETRO_TEMPLATES: RetroTemplateDef[] = [
  FOUR_LS_TEMPLATE,
  FOUR_WS_TEMPLATE,
  START_STOP_CONTINUE_TEMPLATE,
  KEEP_DROP_TRY_TEMPLATE,
  DAKI_TEMPLATE,
  MAD_SAD_GLAD_TEMPLATE,
];

const TEMPLATE_BY_ID = new Map(
  RETRO_TEMPLATES.map((template) => [template.id, template]),
);

const COLUMN_IDS_BY_TEMPLATE = new Map(
  RETRO_TEMPLATES.map((template) => [
    template.id,
    new Set(template.columns.map((column) => column.id)),
  ]),
);

export function normalizeTemplate(
  template: RetroTemplate | undefined,
): RetroTemplate {
  return template ?? "fourLs";
}

export function getTemplateDef(
  template: RetroTemplate | undefined,
): RetroTemplateDef {
  return TEMPLATE_BY_ID.get(normalizeTemplate(template)) ?? FOUR_LS_TEMPLATE;
}

export function getTemplateColumns(
  template: RetroTemplate | undefined,
): RetroColumnDef[] {
  return getTemplateDef(template).columns;
}

export function getTemplateLabel(template: RetroTemplate | undefined): string {
  return getTemplateDef(template).label;
}

export function getTemplateBoardTitle(
  template: RetroTemplate | undefined,
): string {
  return getTemplateDef(template).boardTitle;
}

export function isValidColumnForTemplate(
  template: RetroTemplate | undefined,
  column: string,
): column is RetroColumnId {
  const allowed = COLUMN_IDS_BY_TEMPLATE.get(normalizeTemplate(template));
  return allowed?.has(column as RetroColumnId) ?? false;
}
