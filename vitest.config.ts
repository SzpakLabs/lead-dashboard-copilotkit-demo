import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src")
    }
  },
  test: {
    exclude: [...configDefaults.exclude, ".design-variants/**"],
    environment: "node",
    globals: true
  }
});
