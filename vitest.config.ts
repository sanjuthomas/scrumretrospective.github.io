import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version: string };

if (!process.env.VITE_APP_VERSION) {
  process.env.VITE_APP_VERSION = `v${pkg.version}`;
}

export default mergeConfig(
  viteConfig,
  defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/test/**",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
      },
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "happy-dom",
  },
  }),
);
