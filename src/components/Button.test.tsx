import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders primary buttons by default", () => {
    render(<Button>Start</Button>);
    const button = screen.getByRole("button", { name: "Start" });
    expect(button).toHaveClass("btn--primary");
    expect(button).toHaveAttribute("type", "button");
  });

  it("supports secondary variant and custom classes", () => {
    render(
      <Button variant="secondary" className="extra" type="submit">
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("btn--secondary", "extra");
    expect(button).toHaveAttribute("type", "submit");
  });
});
