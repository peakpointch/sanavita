require("esbuild")
    .build({
        entryPoints: ["js-library/vimeo-component.ts"],
        bundle: true,
        minify: false,
        sourcemap: true,
        outfile: "dist/vimeo-component.js",
    })
    .catch(() => process.exit(1));