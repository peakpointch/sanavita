import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Convert import.meta.url to __dirname
// const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL(".", import.meta.url).pathname;

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: "src/components/index.html",
    },
  },
  server: {
    port: 3030,
    hmr: true, // Explicitly enable HMR

    // Core watcher configuration to ensure stability
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.cache/**"],
    },
  },
  resolve: {
    alias: {
      "@": new URL("..", import.meta.url).pathname, // src/components/..
      "@root": new URL("../..", import.meta.url).pathname, // repo root
    },
  },
});
