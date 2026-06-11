import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardVoteButtons } from "./CardVoteButtons";

describe("CardVoteButtons", () => {
  it("calls onVote for up and down actions", async () => {
    const user = userEvent.setup();
    const onVote = vi.fn().mockResolvedValue(undefined);

    render(
      <CardVoteButtons
        cardId="card-1"
        currentVote={undefined}
        disabled={false}
        onVote={onVote}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Vote up" }));
    await user.click(screen.getByRole("button", { name: "Vote down" }));

    expect(onVote).toHaveBeenCalledWith("card-1", "up");
    expect(onVote).toHaveBeenCalledWith("card-1", "down");
  });

  it("marks the selected vote and disables buttons when requested", () => {
    const { container } = render(
      <CardVoteButtons
        cardId="card-1"
        currentVote="up"
        disabled
        onVote={vi.fn()}
      />,
    );

    const upvote = container.querySelector(".card-vote__btn--up");
    const downvote = container.querySelector(".card-vote__btn--down");

    expect(upvote).toHaveAttribute("aria-pressed", "true");
    expect(upvote).toBeDisabled();
    expect(downvote).toBeDisabled();
  });
});
