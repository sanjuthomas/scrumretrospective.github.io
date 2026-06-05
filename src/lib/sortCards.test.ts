import { describe, expect, it } from "vitest";
import type { RetroCard } from "./retroStore";
import { sortCardsForResults } from "./sortCards";

const cards: RetroCard[] = [
  {
    id: "a",
    column: "liked",
    text: "Older high score",
    authorId: "p1",
    createdAt: 10,
  },
  {
    id: "b",
    column: "liked",
    text: "Newer high score",
    authorId: "p1",
    createdAt: 20,
  },
  {
    id: "c",
    column: "liked",
    text: "Low score",
    authorId: "p2",
    createdAt: 30,
  },
  {
    id: "d",
    column: "learned",
    text: "Other column",
    authorId: "p2",
    createdAt: 40,
  },
];

describe("sortCardsForResults", () => {
  it("filters to the requested column", () => {
    const sorted = sortCardsForResults(cards, "liked", {});
    expect(sorted.map((card) => card.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by net vote descending, then oldest first on ties", () => {
    const sorted = sortCardsForResults(cards, "liked", {
      a: { up: 3, down: 0 },
      b: { up: 3, down: 0 },
      c: { up: 0, down: 1 },
    });

    expect(sorted.map((card) => card.id)).toEqual(["a", "b", "c"]);
  });
});
