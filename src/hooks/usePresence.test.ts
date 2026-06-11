import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendPresenceHeartbeat = vi.fn().mockResolvedValue(true);
const sendPresenceLeave = vi.fn();

vi.mock("../lib/retroApi", () => ({
  sendPresenceHeartbeat: (...args: unknown[]) => sendPresenceHeartbeat(...args),
  sendPresenceLeave: (...args: unknown[]) => sendPresenceLeave(...args),
}));

describe("usePresence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendPresenceHeartbeat.mockClear();
    sendPresenceLeave.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing without retro id or participant id", async () => {
    const { usePresence } = await import("./usePresence");
    renderHook(() => usePresence(undefined, null));

    await vi.advanceTimersByTimeAsync(5000);
    expect(sendPresenceHeartbeat).not.toHaveBeenCalled();
  });

  it("sends heartbeats while mounted", async () => {
    const { usePresence } = await import("./usePresence");
    renderHook(() => usePresence("retro-1", "p1"));

    expect(sendPresenceHeartbeat).toHaveBeenCalledWith("retro-1", "p1");
    sendPresenceHeartbeat.mockClear();

    await vi.advanceTimersByTimeAsync(2000);
    expect(sendPresenceHeartbeat).toHaveBeenCalledWith("retro-1", "p1");
  });

  it("sends leave on pagehide", async () => {
    const { usePresence } = await import("./usePresence");
    renderHook(() => usePresence("retro-1", "p1"));

    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
    expect(sendPresenceLeave).toHaveBeenCalledWith("retro-1", "p1");
  });

  it("skips leave when page is persisted", async () => {
    const { usePresence } = await import("./usePresence");
    renderHook(() => usePresence("retro-1", "p1"));

    const event = new Event("pagehide") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);
    expect(sendPresenceLeave).not.toHaveBeenCalled();
  });

  it("clears heartbeat interval on unmount", async () => {
    const { usePresence } = await import("./usePresence");
    const { unmount } = renderHook(() => usePresence("retro-1", "p1"));

    sendPresenceHeartbeat.mockClear();
    unmount();
    await vi.advanceTimersByTimeAsync(5000);
    expect(sendPresenceHeartbeat).not.toHaveBeenCalled();
  });
});
