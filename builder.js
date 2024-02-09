require("esbuild")
    .build({
        entryPoints: ["js-library/vimeo-component.ts"],
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: "dist/vimeo-component.js",
        format: "esm",
    })
    .catch(() => process.exit(1));