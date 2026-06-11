import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { InitiatePage } from "./InitiatePage";

const navigate = vi.fn();
const createRetro = vi.fn();
const saveParticipantSession = vi.fn();
const saveFacilitatorSession = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../lib/retroStore", () => ({
  createRetro: (...args: unknown[]) => createRetro(...args),
  saveParticipantSession: (...args: unknown[]) => saveParticipantSession(...args),
  saveFacilitatorSession: (...args: unknown[]) => saveFacilitatorSession(...args),
}));

describe("InitiatePage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("creates a retrospective and navigates to the session", async () => {
    const user = userEvent.setup();
    createRetro.mockResolvedValue({
      retro: { id: "retro-99" },
      participantId: "fac-1",
    });

    renderWithRouter(<InitiatePage />);

    await user.type(screen.getByLabelText("Your full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Name your retrospective"), "Sprint 42");
    await user.selectOptions(screen.getByLabelText("Retrospective template"), "fourLs");
    await user.click(screen.getByRole("button", { name: "Create Your Retrospective" }));

    expect(createRetro).toHaveBeenCalledWith("Sprint 42", "Jane Doe", "fourLs");
    expect(saveParticipantSession).toHaveBeenCalledWith("retro-99", "fac-1");
    expect(saveFacilitatorSession).toHaveBeenCalledWith("retro-99", "fac-1");
    expect(navigate).toHaveBeenCalledWith("/retro/retro-99");
  });

  it("shows an error when creation fails", async () => {
    const user = userEvent.setup();
    createRetro.mockRejectedValue(new Error("Sync server offline"));

    renderWithRouter(<InitiatePage />);

    const [nameInput] = screen.getAllByLabelText("Your full name");
    await user.type(nameInput, "Jane Doe");
    await user.type(screen.getByLabelText("Name your retrospective"), "Sprint 42");
    await user.selectOptions(screen.getByLabelText("Retrospective template"), "fourLs");
    await user.click(screen.getByRole("button", { name: "Create Your Retrospective" }));

    expect(screen.getByText("Sync server offline")).toBeInTheDocument();
  });
});
