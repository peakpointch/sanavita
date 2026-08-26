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
  devServer: {
    webflowSubdomain: "sanavita-ag",
    port: 4000,
    livereload: true,
    watchList: ["./src/"],
  },
  environments: [
    {
      name: "website",
      modules: ["./dist/app.js"],
      version: "0.2.0-beta.6",
      pages: [
        "!/anmeldung-wohnen-mit-service",
        "!/admin",
        "!/admin/**/*",
        "!/cms/**/*",
        "!/screen/**/*",
        "!/tv/**/*",
      ],
    },
    {
      name: "forms",
      modules: [
        {
          path: "./dist/app.js",
          version: "0.0.17",
        },
      ],
      version: "0.2.0-beta.6",
      pages: ["/anmeldung-wohnen-mit-service"],
    },
    {
      name: "admin",
      modules: ["./dist/admin.js"],
      version: "0.0.33",
      pages: ["/admin", "/admin/**/*"],
    },
    {
      name: "screen",
      modules: ["./dist/screen.js"],
      version: "0.2.0-beta.5",
      pages: ["/screen/**/*"],
    },
    {
      name: "tv",
      skip: false,
      modules: ["./dist/tv.js"],
      version: "0.2.0-beta.2",
      pages: ["/tv/**/*"],
    },
  ],
});
