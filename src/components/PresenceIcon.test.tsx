import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PresenceIcon } from "./PresenceIcon";

describe("PresenceIcon", () => {
  it("renders online state", () => {
    render(<PresenceIcon online />);
    expect(screen.getByLabelText("Online")).toHaveClass("presence-icon--online");
  });

  it("renders offline state", () => {
    render(<PresenceIcon online={false} />);
    expect(screen.getByLabelText("Offline")).toHaveClass("presence-icon--offline");
  });
});
