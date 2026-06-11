import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyLinkButton } from "./CopyLinkButton";

describe("CopyLinkButton", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("copies the join link with the clipboard API", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(<CopyLinkButton url="https://example.com/join/abc" />);

    await user.click(screen.getByRole("button", { name: "Copy join link" }));
    expect(writeText).toHaveBeenCalledWith("https://example.com/join/abc");
    expect(screen.getByRole("button", { name: "Link copied" })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: "Copy join link" })).toBeInTheDocument();
  });

  it("falls back to execCommand when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const execCommand = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const { container } = render(
      <CopyLinkButton url="https://example.com/join/abc" />,
    );
    await userEvent.click(container.querySelector(".copy-link__btn")!);

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });
});
