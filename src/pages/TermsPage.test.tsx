import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { TermsPage } from "./TermsPage";

describe("TermsPage", () => {
  it("renders terms content and a back link", () => {
    renderWithRouter(<TermsPage />);

    expect(screen.getByRole("heading", { name: "Terms of Use" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to home" })).toHaveAttribute("href", "/");
  });
});
