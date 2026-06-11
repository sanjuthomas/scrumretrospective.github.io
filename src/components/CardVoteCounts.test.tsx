import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardVoteCounts } from "./CardVoteCounts";

describe("CardVoteCounts", () => {
  it("shows up and down totals", () => {
    render(<CardVoteCounts counts={{ up: 3, down: 1 }} />);
    expect(screen.getByLabelText("Vote totals")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
