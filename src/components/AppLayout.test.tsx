import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithRouter } from "../test/renderWithRouter";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("renders routed content and the footer", () => {
    renderWithRouter(
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<p>Page body</p>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ["/"] } },
    );

    expect(screen.getByText("Page body")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Footer links" })).toBeInTheDocument();
  });
});
