import type { FourLsColumn } from "./retroStore";

export interface FourLsColumnDef {
  id: FourLsColumn;
  title: string;
  prompt: string;
}

export const FOUR_LS_COLUMNS: FourLsColumnDef[] = [
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
];

export const FOUR_LS_COLUMN_IDS = new Set<FourLsColumn>(
  FOUR_LS_COLUMNS.map((c) => c.id),
);
