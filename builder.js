require("esbuild")
    .build({
        entryPoints: ["js-library/vimeo.ts"],
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: "dist/vimeo.js",
        format: "esm",
    })
    .catch(() => process.exit(1));