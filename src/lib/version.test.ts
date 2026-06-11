import { describe, expect, it } from "vitest";
import { getAppVersion, getReleaseTagUrl } from "./version";

describe("version", () => {
  it("normalizes package version to a v-prefixed label", () => {
    expect(getAppVersion()).toBe("v1.0.0");
  });

  it("builds a GitHub release URL for the tag", () => {
    expect(getReleaseTagUrl("v1.0.0")).toBe(
      "https://github.com/sanjuthomas/scrumretrospective.github.io/releases/tag/v1.0.0",
    );
    expect(getReleaseTagUrl("1.0.0")).toBe(
      "https://github.com/sanjuthomas/scrumretrospective.github.io/releases/tag/v1.0.0",
    );
  });
});
