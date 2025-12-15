/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages deploys to https://<user>.github.io/<repo>/
  base: "/ninjago/",
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts"],
    },
  },
});
