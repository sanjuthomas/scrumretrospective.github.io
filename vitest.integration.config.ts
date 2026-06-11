import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Hits a local sync API (spawned per run, CI background server, or Docker). Never Railway. */
export default defineConfig({
  plugins: [react()],
  test: {
    name: "integration",
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: "forks",
  },
});
