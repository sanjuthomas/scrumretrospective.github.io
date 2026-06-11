import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { JoinPage } from "./JoinPage";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

vi.mock("../hooks/useRetro", () => ({
  useRetro: () => ({ retro: null, loading: false }),
}));

describe("JoinPage invalid link", () => {
  it("shows an invalid link message when retro id is missing", () => {
    renderWithRouter(<JoinPage />);
    expect(screen.getByRole("heading", { name: "Invalid link" })).toBeInTheDocument();
  });
});
