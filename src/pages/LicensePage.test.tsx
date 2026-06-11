import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "../test/renderWithRouter";
import { LicensePage } from "./LicensePage";

describe("LicensePage", () => {
  it("renders the MIT license page", () => {
    renderWithRouter(<LicensePage />);

    expect(screen.getByRole("heading", { name: "MIT License" })).toBeInTheDocument();
    expect(screen.getByText(/Permission is hereby granted/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to home" })).toHaveAttribute("href", "/");
  });
});
