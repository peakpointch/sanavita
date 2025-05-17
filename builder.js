const esbuild = require("esbuild");
const fg = require("fast-glob");
const path = require("path");

// Function to exclude specific files
function excludeFiles(files, ext = "", excludeList) {
  return files.filter(file => {
    const base = path.basename(file, `.${ext}`);
    return !excludeList.includes(base);
  });
}

// General build function for both modular and non-modular scripts
async function buildScripts(options) {
  const {
    dir,
    outDir,
    excludeList = [],
    minify = true,
    format = "iife",
    recursive = false
  } = options;
  let {
    extensions = ['ts'],
  } = options;

  if (typeof extensions === "string") {
    extensions = [extensions];
  }

  for (const ext of extensions) {
    const pattern = recursive ? `${dir}/**/*.${ext}` : `${dir}/*.${ext}`;
    const files = await fg(pattern);
    const filteredFiles = excludeFiles(files, ext, excludeList);

    for (const entry of filteredFiles) {
      const baseName = path.basename(entry, `.${ext}`);
      const outFile = path.join(outDir, `${baseName}.js`);

      await esbuild.build({
        entryPoints: [entry],
        outfile: outFile,
        bundle: true,
        minify,
        sourcemap: true,
        format,
        minifyIdentifiers: false,
      }).catch(() => process.exit(1));
    }
  }
}

// Helper function for building development files
function buildDevFiles(devFiles) {
  esbuild.build({
    entryPoints: devFiles.map(file => `${file}`),
    outdir: "dist",
    bundle: true,
    minify: false,
    sourcemap: true,
    format: "esm",
    minifyIdentifiers: false,
  }).catch(() => process.exit(1));
}


function build() {
  // Define paths
  const devFiles = [
    "livereload/livereload.js",
  ];

  // Build the scripts
  buildScripts({
    dir: 'src/sanavita',
    outDir: 'dist/sanavita',
    extensions: ['ts', 'js'],
    excludeList: [],
    minify: false,
    format: 'iife',
    recursive: true,
  });

  buildScripts({
    dir: 'src/peakpoint',
    outDir: 'dist/peakpoint',
    extensions: ['ts', 'js'],
    excludeList: [],
    minify: false,
    format: 'iife',
    recursive: true,
  });

  buildScripts({
    dir: 'src/ts',
    outDir: 'dist',
    extensions: 'ts',
    excludeList: [],
    minify: false,
    format: 'iife',
    recursive: false,
  });

  buildScripts({
    dir: 'src/js',
    outDir: 'dist',
    extensions: 'js',
    excludeList: ['admin'],
    minify: false,
    format: 'iife',
    recursive: false,
  });

  // Build development files
  buildDevFiles(devFiles);
}

build();

module.exports = { build, buildScripts, buildDevFiles };
