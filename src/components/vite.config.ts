import { URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: import.meta.dirname,
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
    proxy: {
      "/webflow-proxy": {
        target: "https://sanavita-ag.webflow.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webflow-proxy/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": new URL("../", import.meta.url).pathname, // repo root
    },
  },
});
