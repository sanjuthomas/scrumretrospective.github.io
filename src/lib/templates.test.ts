import { describe, expect, it } from "vitest";
import {
  getTemplateColumns,
  getTemplateLabel,
  isValidColumnForTemplate,
  normalizeTemplate,
} from "./templates";

describe("templates", () => {
  it("defaults missing template to 4Ls", () => {
    expect(normalizeTemplate(undefined)).toBe("fourLs");
    expect(getTemplateLabel(undefined)).toBe("4Ls");
  });

  it("returns 4Ls columns", () => {
    expect(getTemplateColumns("fourLs").map((column) => column.id)).toEqual([
      "liked",
      "learned",
      "lacked",
      "longedFor",
    ]);
  });

  it("returns 4 W's columns", () => {
    expect(getTemplateColumns("fourWs").map((column) => column.id)).toEqual([
      "wentWell",
      "didNotGoWell",
      "learned",
      "shouldChange",
    ]);
  });

  it("returns Mad, Sad, Glad columns", () => {
    expect(getTemplateColumns("madSadGlad").map((column) => column.id)).toEqual([
      "mad",
      "sad",
      "glad",
    ]);
  });

  it("validates columns per template", () => {
    expect(isValidColumnForTemplate("fourLs", "liked")).toBe(true);
    expect(isValidColumnForTemplate("fourLs", "mad")).toBe(false);
    expect(isValidColumnForTemplate("fourWs", "wentWell")).toBe(true);
    expect(isValidColumnForTemplate("fourWs", "liked")).toBe(false);
    expect(isValidColumnForTemplate("madSadGlad", "glad")).toBe(true);
    expect(isValidColumnForTemplate("madSadGlad", "liked")).toBe(false);
  });
});
