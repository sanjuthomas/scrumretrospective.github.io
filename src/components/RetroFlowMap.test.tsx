import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RetroFlowMap } from "./RetroFlowMap";

describe("RetroFlowMap", () => {
  it("renders all retrospective phases", () => {
    render(<RetroFlowMap />);

    expect(screen.getByText("Team Assembly")).toBeInTheDocument();
    expect(screen.getByText("Retrospective")).toBeInTheDocument();
    expect(screen.getByText("Voting")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getByText("Facilitator")).toBeInTheDocument();
    expect(screen.getByText("Participant")).toBeInTheDocument();
  });
});
