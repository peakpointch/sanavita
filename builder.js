require("esbuild")
    .build({
        entryPoints: ["js-library/banner.js"],
        bundle: true,
        minify: true,
        sourcemap: false,
        outfile: "dist/banner.js",
        format: "esm",
    })
    .catch(() => process.exit(1));