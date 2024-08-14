const esbuild = require("esbuild");

function build() {
  const files = {
    "ts": [
      "banner",
      "iphone-vimeo-player"
    ],
    "js": [
      "circle-tabs",
      "circle",
      "cms-form-select",
      "copy",
      "crc",
      "jobs",
      "marquee",
      "popup-cookie",
      "popup",
      "purecounter",
      "scroll",
      "swiper",
      "translate-dates",
    ]
  }

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
}

build();

module.exports = build;