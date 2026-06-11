import { describe, expect, it } from "vitest";
import { FOUR_LS_COLUMNS, FOUR_LS_COLUMN_IDS } from "./fourLs";

describe("fourLs", () => {
  it("exports 4 Ls column definitions", () => {
    expect(FOUR_LS_COLUMNS).toHaveLength(4);
    expect(FOUR_LS_COLUMNS.map((column) => column.id)).toEqual([
      "liked",
      "learned",
      "lacked",
      "longedFor",
    ]);
  });

  it("exposes a set of valid column ids", () => {
    expect(FOUR_LS_COLUMN_IDS.has("liked")).toBe(true);
    expect(FOUR_LS_COLUMN_IDS.has("invalid" as "liked")).toBe(false);
  });
});
