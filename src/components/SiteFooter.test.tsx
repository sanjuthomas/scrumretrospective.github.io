import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("renders legal and repository links", () => {
    renderWithRouter(<SiteFooter />);

    expect(screen.getByRole("navigation", { name: "Footer links" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "MIT License" })).toHaveAttribute(
      "href",
      "/license",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
  });
});
