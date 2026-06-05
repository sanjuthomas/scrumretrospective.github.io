/** @deprecated Import from ./templates instead */
import {
  FOUR_LS_TEMPLATE,
  type FourLsColumnId,
  type RetroColumnDef,
} from "./templates";

export type { FourLsColumnId, RetroColumnDef as FourLsColumnDef };
export const FOUR_LS_COLUMNS = FOUR_LS_TEMPLATE.columns;
export const FOUR_LS_COLUMN_IDS = new Set<FourLsColumnId>(
  FOUR_LS_TEMPLATE.columns.map((column) => column.id as FourLsColumnId),
);
