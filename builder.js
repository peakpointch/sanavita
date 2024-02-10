require("esbuild")
    .build({
        entryPoints: ["js-library/iphone-vimeo-player.ts"],
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: "dist/iphone-vimeo-player.js",
        format: "esm",
    })
    .catch(() => process.exit(1));