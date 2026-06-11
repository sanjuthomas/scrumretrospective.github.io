import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Retrospective } from "../lib/retroStore";

const subscribeRetro = vi.fn();
const getCachedRetro = vi.fn();

vi.mock("../lib/retroStore", () => ({
  getCachedRetro: (...args: unknown[]) => getCachedRetro(...args),
  subscribeRetro: (...args: unknown[]) => subscribeRetro(...args),
}));

const retro: Retrospective = {
  id: "retro-1",
  name: "Sprint Retro",
  createdAt: 1,
  participants: [],
};

describe("useRetro", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no retro id is provided", async () => {
    const { useRetro } = await import("./useRetro");
    const { result } = renderHook(() => useRetro(undefined));

    expect(result.current.retro).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(subscribeRetro).not.toHaveBeenCalled();
  });

  it("seeds state from cache and subscribes to updates", async () => {
    getCachedRetro.mockReturnValue(retro);
    subscribeRetro.mockImplementation(
      (
        _retroId: string,
        listener: (retro: Retrospective | null, loading: boolean) => void,
      ) => {
        listener(retro, false);
        return vi.fn();
      },
    );

    const { useRetro } = await import("./useRetro");
    const { result } = renderHook(() => useRetro("retro-1", "p1"));

    await waitFor(() => {
      expect(result.current.retro).toEqual(retro);
      expect(result.current.loading).toBe(false);
    });
    expect(subscribeRetro).toHaveBeenCalledWith(
      "retro-1",
      expect.any(Function),
      "p1",
    );
  });

  it("unsubscribes on unmount", async () => {
    const unsubscribe = vi.fn();
    getCachedRetro.mockReturnValue(null);
    subscribeRetro.mockReturnValue(unsubscribe);

    const { useRetro } = await import("./useRetro");
    const { unmount } = renderHook(() => useRetro("retro-1"));

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
