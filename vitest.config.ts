import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
});
