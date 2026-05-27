import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/game-of-life-sim/",
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
