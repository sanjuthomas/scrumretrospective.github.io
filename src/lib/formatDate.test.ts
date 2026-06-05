import { describe, expect, it } from "vitest";
import { formatDuration, formatRetroCreatedAt } from "./formatDate";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90 * 60_000)).toBe("1 hr 30 min");
  });

  it("formats hours only", () => {
    expect(formatDuration(2 * 60 * 60_000)).toBe("2 hr");
  });

  it("formats minutes only", () => {
    expect(formatDuration(15 * 60_000)).toBe("15 min");
  });

  it("formats sub-minute durations", () => {
    expect(formatDuration(30_000)).toBe("Less than 1 min");
  });

  it("never returns negative durations", () => {
    expect(formatDuration(-60_000)).toBe("Less than 1 min");
  });
});

describe("formatRetroCreatedAt", () => {
  it("returns a non-empty localized date string", () => {
    const formatted = formatRetroCreatedAt(Date.UTC(2026, 5, 4, 14, 30));
    expect(formatted.length).toBeGreaterThan(0);
  });
});
