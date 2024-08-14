const esbuild = require("esbuild");

const files = {
  "ts": [
    "webflow.config",
    "banner",
    "iphone-vimeo-player"
  ],
  "js": [
    "circle-tabs",
    "circle",
    "cms-form-select",
    "copy",
    "crc",
    "date",
    "marquee",
    "popup-cookie",
    "popup",
    "purecounter",
    "scroll",
    "sozjobs",
    "swiper",
    "translate-dates",
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
        format: "esm",
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