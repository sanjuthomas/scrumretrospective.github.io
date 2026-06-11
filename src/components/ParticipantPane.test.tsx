import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Participant } from "../lib/retroStore";
import { ParticipantPane } from "./ParticipantPane";

const participants: Participant[] = [
  {
    id: "part-1",
    fullName: "Alex",
    isFacilitator: false,
    joinedAt: 2,
    online: true,
  },
  {
    id: "fac-1",
    fullName: "Facilitator",
    isFacilitator: true,
    joinedAt: 1,
    online: false,
  },
];

describe("ParticipantPane", () => {
  it("sorts facilitators first and marks the current participant", () => {
    render(
      <ParticipantPane
        participants={participants}
        currentParticipantId="part-1"
      />,
    );

    const names = screen.getAllByText(/Facilitator|Alex/).map((node) => node.textContent);
    expect(names[0]).toBe("Facilitator");
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
