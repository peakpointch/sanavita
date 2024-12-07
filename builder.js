const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Function to get all files from a directory with a specific extension
function getFilesFromDirectory(dir, extension) {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith(`.${extension}`)).map(file => path.basename(file, `.${extension}`));
}

// Function to exclude specific files
function excludeFiles(files, excludeList) {
  return files.filter(file => !excludeList.includes(file));
}

// General build function for both modular and non-modular scripts
function buildScripts(dir, outDir, extension = 'ts', excludeList = [], minify = false, format = "esm") {
  const files = getFilesFromDirectory(dir, extension);
  const filteredFiles = excludeFiles(files, excludeList);

  for (const name of filteredFiles) {
    esbuild.build({
      entryPoints: [`${dir}/${name}.${extension}`], // Include both TS and JS entry points
      outfile: `${outDir}/${name}.js`,
      bundle: true,
      minify: minify,
      sourcemap: false,
      format: format,
      minifyIdentifiers: false,
    }).catch((e) => {
      console.error(`Error building ${name}:`, e);
      process.exit(1);
    });
  }
}

// Helper function for building development files
function buildDevFiles(devFiles) {
  esbuild.build({
    entryPoints: devFiles.map(file => `${file}`),
    outdir: "dist",
    bundle: true,
    minify: false,
    sourcemap: false,
    format: "esm",
    minifyIdentifiers: false,
  }).catch(() => process.exit(1));
}

// Build the library separately
function buildLibrary(libraryDir, outDir) {
  const files = getFilesFromDirectory(libraryDir, 'ts');

  for (const name of files) {
    esbuild.build({
      entryPoints: [`${libraryDir}/${name}.ts`],
      outfile: `${outDir}/${name}.js`,
      bundle: true,
      minify: false, // Keep names for reusability
      sourcemap: false,
      format: "esm",
      minifyIdentifiers: false,
    }).catch((e) => {
      console.error(`Error building library ${name}:`, e);
      process.exit(1);
    });
  }
}

// Define paths
const libraryDir = 'library';
const devFiles = [
  "livereload/livereload.js",
];

// Build the library
buildLibrary(libraryDir, 'dist/library');

// Build the scripts
buildScripts('src/ts', 'dist', 'ts', [], true, "iife");
buildScripts('src/js', 'dist', 'js', ['admin'], true, "iife");

// Build development files
buildDevFiles(devFiles);

module.exports = { buildScripts, buildLibrary, buildDevFiles };
