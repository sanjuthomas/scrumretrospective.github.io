import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Retrospective } from "../lib/retroStore";
import { renderWithRouter } from "../test/renderWithRouter";
import { JoinPage } from "./JoinPage";

const navigate = vi.fn();
const useRetro = vi.fn();
const addParticipant = vi.fn();
const saveParticipantSession = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigate,
    useParams: () => ({ retroId: "retro-1" }),
  };
});

vi.mock("../hooks/useRetro", () => ({
  useRetro: (...args: unknown[]) => useRetro(...args),
}));

vi.mock("../lib/retroStore", () => ({
  addParticipant: (...args: unknown[]) => addParticipant(...args),
  saveParticipantSession: (...args: unknown[]) => saveParticipantSession(...args),
}));

const retro: Retrospective = {
  id: "retro-1",
  name: "Sprint Retro",
  createdAt: 1,
  participants: [],
};

describe("JoinPage", () => {
  it("shows loading state", () => {
    useRetro.mockReturnValue({ retro: null, loading: true });
    renderWithRouter(<JoinPage />);
    expect(screen.getByText("Fetching session details.")).toBeInTheDocument();
  });

  it("shows not found state", () => {
    useRetro.mockReturnValue({ retro: null, loading: false });
    renderWithRouter(<JoinPage />);
    expect(screen.getByRole("heading", { name: "Retrospective not found" })).toBeInTheDocument();
  });

  it("joins an existing retrospective", async () => {
    const user = userEvent.setup();
    useRetro.mockReturnValue({ retro, loading: false });
    addParticipant.mockResolvedValue({ retro, participantId: "part-1" });

    renderWithRouter(<JoinPage />);
    await user.type(screen.getByLabelText("Your full name"), "Alex");
    await user.click(screen.getByRole("button", { name: "Join Sprint Retro Now!" }));

    expect(addParticipant).toHaveBeenCalledWith("retro-1", "Alex");
    expect(saveParticipantSession).toHaveBeenCalledWith("retro-1", "part-1");
    expect(navigate).toHaveBeenCalledWith("/retro/retro-1");
  });
});
