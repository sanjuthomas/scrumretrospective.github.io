import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the landing page route", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Scrum Retrospective" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Initiate a Retrospective" }),
    ).toBeInTheDocument();
  });
});
