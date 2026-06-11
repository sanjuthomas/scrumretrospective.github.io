import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Retrospective } from "../lib/retroStore";
import { renderWithRouter } from "../test/renderWithRouter";
import { SessionPage } from "./SessionPage";

const navigate = vi.fn();
const useRetro = vi.fn();
const startRetro = vi.fn();
const startVoting = vi.fn();
const closeVoting = vi.fn();
const endRetro = vi.fn();
const downloadRetroPdf = vi.fn();
const transferFacilitatorRole = vi.fn();

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

vi.mock("../hooks/usePresence", () => ({
  usePresence: vi.fn(),
}));

vi.mock("../lib/exportRetroPdf", () => ({
  downloadRetroPdf: (...args: unknown[]) => downloadRetroPdf(...args),
}));

vi.mock("../lib/retroStore", async () => {
  const actual = await vi.importActual<typeof import("../lib/retroStore")>(
    "../lib/retroStore",
  );
  return {
    ...actual,
    getParticipantSession: () => "fac-1",
    getJoinUrl: () => "https://example.com/join/retro-1",
    isCurrentFacilitator: () => true,
    startRetro: (...args: unknown[]) => startRetro(...args),
    startVoting: (...args: unknown[]) => startVoting(...args),
    closeVoting: (...args: unknown[]) => closeVoting(...args),
    endRetro: (...args: unknown[]) => endRetro(...args),
    transferFacilitatorRole: (...args: unknown[]) =>
      transferFacilitatorRole(...args),
  };
});

function makeRetro(overrides: Partial<Retrospective> = {}): Retrospective {
  return {
    id: "retro-1",
    name: "Sprint Retro",
    createdAt: Date.UTC(2026, 5, 4),
    template: "fourLs",
    phase: "assembly",
    participants: [
      {
        id: "fac-1",
        fullName: "Facilitator",
        isFacilitator: true,
        joinedAt: 1,
        online: true,
      },
    ],
    cards: [],
    ...overrides,
  };
}

describe("SessionPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows loading and missing states", () => {
    useRetro.mockReturnValue({ retro: null, loading: true });
    const { rerender } = renderWithRouter(<SessionPage />);
    expect(screen.getByText("Connecting to the retrospective.")).toBeInTheDocument();

    useRetro.mockReturnValue({ retro: null, loading: false });
    rerender(<SessionPage />);
    expect(screen.getByRole("heading", { name: "Session not found" })).toBeInTheDocument();
  });

  it("lets facilitators start the retrospective", async () => {
    const user = userEvent.setup();
    const retro = makeRetro();
    useRetro.mockReturnValue({ retro, loading: false });
    startRetro.mockResolvedValue({ ...retro, phase: "active" });

    renderWithRouter(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Start Your Retrospective" }));
    expect(startRetro).toHaveBeenCalledWith("retro-1");
  });

  it("lets facilitators manage voting and end the retro", async () => {
    const user = userEvent.setup();
    const active = makeRetro({ phase: "active" });
    const voting = makeRetro({ phase: "voting" });
    const results = makeRetro({ phase: "results" });

    useRetro.mockReturnValue({ retro: active, loading: false });
    const { rerender } = renderWithRouter(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Start Voting" }));
    expect(startVoting).toHaveBeenCalledWith("retro-1");

    useRetro.mockReturnValue({ retro: voting, loading: false });
    rerender(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Close Voting" }));
    expect(closeVoting).toHaveBeenCalledWith("retro-1", "fac-1");

    useRetro.mockReturnValue({ retro: results, loading: false });
    rerender(<SessionPage />);
    endRetro.mockResolvedValue(undefined);
    await user.click(screen.getByRole("button", { name: "End Retrospective" }));
    expect(downloadRetroPdf).toHaveBeenCalledWith(results);
    expect(endRetro).toHaveBeenCalledWith("retro-1");
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("transfers facilitator role after confirmation", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const retro = makeRetro({
      phase: "active",
      participants: [
        {
          id: "fac-1",
          fullName: "Facilitator",
          isFacilitator: true,
          joinedAt: 1,
          online: true,
        },
        {
          id: "part-1",
          fullName: "Alex",
          isFacilitator: false,
          joinedAt: 2,
          online: true,
        },
      ],
    });

    useRetro.mockReturnValue({ retro, loading: false });
    transferFacilitatorRole.mockResolvedValue({
      ...retro,
      participants: retro.participants.map((p) => ({
        ...p,
        isFacilitator: p.id === "part-1",
      })),
    });

    renderWithRouter(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Make Alex facilitator" }));

    expect(confirm).toHaveBeenCalled();
    expect(transferFacilitatorRole).toHaveBeenCalledWith(
      "retro-1",
      "fac-1",
      "part-1",
    );

    confirm.mockRestore();
  });

  it("does not transfer facilitator role when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const retro = makeRetro({
      phase: "active",
      participants: [
        {
          id: "fac-1",
          fullName: "Facilitator",
          isFacilitator: true,
          joinedAt: 1,
          online: true,
        },
        {
          id: "part-1",
          fullName: "Alex",
          isFacilitator: false,
          joinedAt: 2,
          online: true,
        },
      ],
    });

    useRetro.mockReturnValue({ retro, loading: false });
    renderWithRouter(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Make Alex facilitator" }));

    expect(transferFacilitatorRole).not.toHaveBeenCalled();

    confirm.mockRestore();
  });

  it("shows an error when facilitator transfer fails", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const retro = makeRetro({
      phase: "active",
      participants: [
        {
          id: "fac-1",
          fullName: "Facilitator",
          isFacilitator: true,
          joinedAt: 1,
          online: true,
        },
        {
          id: "part-1",
          fullName: "Alex",
          isFacilitator: false,
          joinedAt: 2,
          online: true,
        },
      ],
    });

    useRetro.mockReturnValue({ retro, loading: false });
    transferFacilitatorRole.mockRejectedValue(new Error("Transfer blocked"));

    renderWithRouter(<SessionPage />);
    await user.click(screen.getByRole("button", { name: "Make Alex facilitator" }));

    expect(screen.getByText("Transfer blocked")).toBeInTheDocument();

    confirm.mockRestore();
  });
});
