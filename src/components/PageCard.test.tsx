import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageCard } from "./PageCard";

describe("PageCard", () => {
  it("renders title, subtitle, and children", () => {
    render(
      <PageCard title="Hello" subtitle="World">
        <p>Body</p>
      </PageCard>,
    );

    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("applies wide layout class when requested", () => {
    const { container } = render(
      <PageCard wide>
        <p>Wide</p>
      </PageCard>,
    );

    expect(container.firstChild).toHaveClass("page-card--wide");
  });
});
