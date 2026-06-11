import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    cleanup();
  });

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

  it("lets the facilitator transfer the role to another participant", async () => {
    const user = userEvent.setup();
    const onTransferFacilitator = vi.fn();

    render(
      <ParticipantPane
        participants={participants}
        currentParticipantId="fac-1"
        canTransferFacilitator
        onTransferFacilitator={onTransferFacilitator}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Make Alex facilitator" }),
    );
    expect(onTransferFacilitator).toHaveBeenCalledWith("part-1");
  });

  it("hides transfer controls for non-facilitators and the current user", () => {
    render(
      <ParticipantPane
        participants={participants}
        currentParticipantId="part-1"
        canTransferFacilitator={false}
        onTransferFacilitator={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Make Alex facilitator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Make Facilitator facilitator" }),
    ).not.toBeInTheDocument();
  });

  it("disables transfer buttons while a transfer is in progress", () => {
    const { container } = render(
      <ParticipantPane
        participants={participants}
        currentParticipantId="fac-1"
        canTransferFacilitator
        transferringParticipantId="part-1"
        onTransferFacilitator={vi.fn()}
      />,
    );

    expect(container.querySelector(".participant-pane__transfer-btn")).toBeDisabled();
  });
});
