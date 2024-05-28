require("esbuild")
    .build({
        entryPoints: ["js-library/banner.ts"],
        outfile: "dist/banner.js",
        bundle: true,
        minify: true,
        sourcemap: false,
        format: "esm",
        minifyIdentifiers: false,
        // keepNames: true,
    })
    .catch(() => process.exit(1));