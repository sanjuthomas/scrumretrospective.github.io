import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Participant, RetroCard } from "../lib/retroStore";
import { START_STOP_CONTINUE_TEMPLATE } from "../lib/templates";
import { RetroColumn } from "./RetroColumn";

const column = START_STOP_CONTINUE_TEMPLATE.columns[0]!;
const participantsById = new Map<string, Participant>([
  [
    "fac-1",
    {
      id: "fac-1",
      fullName: "Facilitator",
      isFacilitator: true,
      joinedAt: 1,
    },
  ],
  [
    "part-1",
    {
      id: "part-1",
      fullName: "Alex",
      isFacilitator: false,
      joinedAt: 2,
    },
  ],
]);

const cards: RetroCard[] = [
  {
    id: "card-1",
    column: "start",
    text: "Keep pairing",
    authorId: "part-1",
    createdAt: 2,
  },
];

describe("RetroColumn", () => {
  it("submits new cards when adding is enabled", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(
      <RetroColumn
        column={column}
        cards={[]}
        participantsById={participantsById}
        canAdd
        canVote={false}
        showResults={false}
        currentParticipantId="fac-1"
        myVotes={{}}
        cardVoteCounts={{}}
        onAdd={onAdd}
        onVote={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/Add to Start/i), "More demos");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledWith("More demos");
  });

  it("shows vote buttons for other participants' cards", async () => {
    const user = userEvent.setup();
    const onVote = vi.fn().mockResolvedValue(undefined);

    render(
      <RetroColumn
        column={column}
        cards={cards}
        participantsById={participantsById}
        canAdd={false}
        canVote
        showResults={false}
        currentParticipantId="fac-1"
        myVotes={{}}
        cardVoteCounts={{}}
        onAdd={vi.fn()}
        onVote={onVote}
      />,
    );

    expect(screen.getByText("Keep pairing")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Vote up" }));
    expect(onVote).toHaveBeenCalledWith("card-1", "up");
  });

  it("shows sorted results with vote totals", () => {
    render(
      <RetroColumn
        column={column}
        cards={cards}
        participantsById={participantsById}
        canAdd={false}
        canVote={false}
        showResults
        currentParticipantId="fac-1"
        myVotes={{}}
        cardVoteCounts={{ "card-1": { up: 4, down: 1 } }}
        onAdd={vi.fn()}
        onVote={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Vote totals")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("surfaces add errors", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockRejectedValue(new Error("Server down"));

    const { container } = render(
      <RetroColumn
        column={column}
        cards={[]}
        participantsById={participantsById}
        canAdd
        canVote={false}
        showResults={false}
        currentParticipantId="fac-1"
        myVotes={{}}
        cardVoteCounts={{}}
        onAdd={onAdd}
        onVote={vi.fn()}
      />,
    );

    const input = container.querySelector("textarea")!;
    await user.type(input, "Broken");
    await user.click(container.querySelector(".four-ls-column__submit")!);

    expect(screen.getByText("Server down")).toBeInTheDocument();
  });
});
