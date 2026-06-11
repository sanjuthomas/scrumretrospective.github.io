import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Retrospective } from "../lib/retroStore";
import { RetroBoard } from "./RetroBoard";

const addCard = vi.fn();
const castVote = vi.fn();

vi.mock("../lib/retroStore", async () => {
  const actual = await vi.importActual<typeof import("../lib/retroStore")>(
    "../lib/retroStore",
  );
  return {
    ...actual,
    addCard: (...args: unknown[]) => addCard(...args),
    castVote: (...args: unknown[]) => castVote(...args),
  };
});

const retro: Retrospective = {
  id: "retro-1",
  name: "Sprint Retro",
  createdAt: 1,
  template: "startStopContinue",
  phase: "active",
  participants: [
    {
      id: "fac-1",
      fullName: "Facilitator",
      isFacilitator: true,
      joinedAt: 1,
    },
  ],
  cards: [],
};

describe("RetroBoard", () => {
  it("renders three-column templates with add guidance", () => {
    render(
      <RetroBoard
        retro={retro}
        retroId="retro-1"
        phase="active"
        currentParticipantId="fac-1"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Start, Stop, Continue Retrospective" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add items to any column. Everyone sees updates in real time."),
    ).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("shows voting and results subtitles", () => {
    const { rerender } = render(
      <RetroBoard
        retro={retro}
        retroId="retro-1"
        phase="voting"
        currentParticipantId={null}
      />,
    );

    expect(
      screen.getByText("Voting is in progress. Join to cast your votes."),
    ).toBeInTheDocument();

    rerender(
      <RetroBoard
        retro={{ ...retro, phase: "results" }}
        retroId="retro-1"
        phase="results"
        currentParticipantId={null}
      />,
    );

    expect(
      screen.getByText(
        "Voting is closed. Items are sorted by net votes (up minus down) in each column.",
      ),
    ).toBeInTheDocument();
  });
});
