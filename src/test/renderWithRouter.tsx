import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

interface Options extends Omit<RenderOptions, "wrapper"> {
  routerProps?: MemoryRouterProps;
}

export function renderWithRouter(
  ui: ReactElement,
  { routerProps, ...options }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter {...routerProps}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
