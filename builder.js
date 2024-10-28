const esbuild = require("esbuild");

const files = {
  "ts": [
    "webflow.config",
    "banner",
    "iphone-vimeo-player",
    "form",
    "sanavita-form",
  ],
  "js": [
    "circle-tabs",
    "circle",
    "count-down",
    "cms-form-select",
    "cms-group",
    "copy",
    "crc",
    "date",
    "marquee",
    "popup-cookie",
    "popup",
    "purecounter",
    "sanavita-video",
    "scroll",
    "sozjobs",
    "sozjobs-job",
    "swiper",
    "timeline",
    "translate-dates",
    "uploadcare",
  ]
}

const devFiles = [
  "livereload/livereload.js",
]

function build(files, devFiles) {
  for (const [extension, names] of Object.entries(files)) {
    names.forEach(name => {
      esbuild.build({
        entryPoints: [`assets/${extension}/${name}.${extension}`],
        outfile: `dist/${name}.js`, // Output directly to the dist folder
        bundle: true,
        minify: true,
        sourcemap: false,
        format: "iife",
        minifyIdentifiers: false,
        // keepNames: true,
      }).catch(() => process.exit(1));
    });
  }

  esbuild.build({
    entryPoints: devFiles,
    outdir: "dist", // Output directly to the dist folder
    bundle: true,
    minify: false,
    sourcemap: false,
    format: "esm",
    minifyIdentifiers: false,
    // keepNames: true,
  }).catch(() => process.exit(1));
}

build(files, devFiles);

module.exports = { files, devFiles, build };