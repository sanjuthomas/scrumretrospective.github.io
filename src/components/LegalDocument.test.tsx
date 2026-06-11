import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalDocument } from "./LegalDocument";

describe("LegalDocument", () => {
  it("renders metadata, paragraphs, and lists", () => {
    render(
      <LegalDocument
        title="Terms"
        effectiveDate="June 1, 2026"
        intro="Please read carefully."
        sections={[
          {
            title: "Use",
            paragraphs: ["Be kind."],
            list: ["No abuse", "No scraping"],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Terms" })).toBeInTheDocument();
    expect(screen.getByText("Effective date: June 1, 2026")).toBeInTheDocument();
    expect(screen.getByText("Please read carefully.")).toBeInTheDocument();
    expect(screen.getByText("Be kind.")).toBeInTheDocument();
    expect(screen.getByText("No abuse")).toBeInTheDocument();
  });
});
