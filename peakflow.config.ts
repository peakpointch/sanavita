import { defineConfig } from "peakflow/config";

export default defineConfig({
  repository: {
    owner: "peakpointch",
    name: "sanavita",
  },
  build: {
    modules: [
      "./src/app.ts",
      "./src/admin.ts",
      "./src/screen.ts",
      "./src/tv.ts",
      "./src/styles/app.css",
    ],
    outdir: "./dist",
  },
  server: {
    webflowSubdomain: "sanavita-ag",
    port: 3000,
    livereload: true,
    watchList: ["./src/", "../../peakflow/src/form/"],
  },
  environments: [
    {
      name: "website",
      modules: ["app.js"],
      version: "0.2.0-beta.4",
      pages: ["index", "lindenpark", "wohnen-mit-service", "bistro/*", "dokumente"],
    },
    {
      name: "forms",
      modules: [
        {
          file: "app.js",
          version: "0.2.0-beta.0",
        },
        "styles/app.css",
      ],
      version: "0.2.0-beta.4",
      pages: ["screen/**/*"],
    },
    {
      name: "admin",
      modules: ["admin.js"],
      version: "0.2.0-beta.4",
      pages: ["screen/*"],
    },
    {
      name: "screen",
      modules: ["screen.js"],
      version: "0.2.0-beta.4",
      pages: ["screen/*"],
    },
    {
      name: "tv",
      modules: ["tv.js"],
      version: "0.2.0-beta.4",
      pages: ["tv/*"],
    },
  ],
});
