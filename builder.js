require("esbuild")
    .build({
        entryPoints: [
          "assets/ts/banner.ts",
          "assets/ts/iphone-vimeo-player.ts",
        ],
        outdir: "dist",
        bundle: true,
        minify: true,
        sourcemap: false,
        format: "esm",
        minifyIdentifiers: false,
        // keepNames: true,
    })
    .catch(() => process.exit(1));