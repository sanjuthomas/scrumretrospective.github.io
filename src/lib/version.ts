import pkg from "../../package.json";
import { GITHUB_REPO_URL } from "../content/legal";

function normalizeVersion(raw: string): string {
  return raw.startsWith("v") ? raw : `v${raw}`;
}

/** Version label baked in at build time (git tag in CI, package.json locally). */
export function getAppVersion(): string {
  const raw = import.meta.env.VITE_APP_VERSION?.trim();
  if (raw) return normalizeVersion(raw);
  return normalizeVersion(pkg.version);
}

export function getReleaseTagUrl(version: string): string {
  const tag = normalizeVersion(version);
  return `${GITHUB_REPO_URL}/releases/tag/${tag}`;
}
