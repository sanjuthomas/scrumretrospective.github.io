import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { LandingPage } from "./LandingPage";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe("LandingPage", () => {
  it("navigates to initiate flow from the hero CTA", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LandingPage />);

    await user.click(screen.getByRole("button", { name: "Initiate a Retrospective" }));
    expect(navigate).toHaveBeenCalledWith("/initiate");
  });
});
