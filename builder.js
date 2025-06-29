import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import fg from 'fast-glob';
import { findUpSync } from 'find-up';

export function getPackageJson() {
  const packagePath = findUpSync('package.json');
  const raw = fs.readFileSync(packagePath, 'utf-8');
  return JSON.parse(raw);
}

export function getDevBoolean() {
  const pkg = getPackageJson();
  const peakflowValue = `${pkg.dependencies.peakflow}`;
  return peakflowValue.startsWith('file:');
}

// Function to exclude specific files
function excludeFiles(files, extensions = [], excludeList = []) {
  return files.filter(file => {
    const normalizedFile = path.normalize(file);
    const fileBaseName = path.basename(file);
    const fileNameNoExt = path.basename(file, path.extname(file));

    return !excludeList.some(exclude => {
      const normalizedExclude = path.normalize(exclude);

      // 1. Match full path prefix (for directories)
      if (normalizedFile.startsWith(normalizedExclude)) return true;

      // 2. Match full file name (e.g. "somefile.ts")
      if (fileBaseName === normalizedExclude) return true;

      // 3. Match name without extension (e.g. "anotherfile" matches anotherfile.ts/js/etc.)
      if (
        extensions.some(ext =>
          normalizedExclude === fileNameNoExt && file.endsWith(`.${ext}`)
        )
      ) return true;

      return false;
    });
  });
}

// General build function for both modular and non-modular scripts
export async function buildScripts(options) {
  const {
    dir,
    outDir,
    excludeList = [],
    minify = true,
    format = "iife",
    recursive = false,
    tsconfig
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
    const filteredFiles = excludeFiles(files, [ext], excludeList);

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
        tsconfig
      }).catch(() => process.exit(1));
    }
  }
}

// Helper function for building development files
export async function buildDevFiles(options) {
  const {
    devFiles,
    tsconfig
  } = options;
  await esbuild.build({
    entryPoints: devFiles.map(file => `${file}`),
    outdir: "dist",
    bundle: true,
    minify: false,
    sourcemap: true,
    format: "esm",
    minifyIdentifiers: false,
    tsconfig
  }).catch(() => process.exit(1));
}


export async function build(tsconfig) {
  const dev = getDevBoolean();
  const tsconfigFile = dev === true
    ? findUpSync('./tsconfig.dev.json')
    : findUpSync('./tsconfig.json');

  if (dev) {
    console.log('🛠️ Building with local lib.');
  } else {
    console.log('🛠️ Building with remote lib.');
  }

  if (!tsconfig) {
    tsconfig = tsconfigFile;
  }

  // Build the scripts
  await buildScripts({
    dir: 'src/sanavita',
    outDir: 'dist/sanavita',
    extensions: ['ts', 'js'],
    excludeList: [
      './src/sanavita/ts/utility/',
      './src/sanavita/ts/form/',
    ],
    minify: false,
    format: 'iife',
    recursive: true,
    tsconfig
  });

  await buildScripts({
    dir: 'src/peakpoint',
    outDir: 'dist/peakpoint',
    extensions: ['ts', 'js'],
    excludeList: [],
    minify: false,
    format: 'iife',
    recursive: true,
    tsconfig
  });

  await buildScripts({
    dir: 'src/ts',
    outDir: 'dist',
    extensions: 'ts',
    excludeList: [],
    minify: false,
    format: 'iife',
    recursive: false,
    tsconfig
  });

  await buildScripts({
    dir: 'src/js',
    outDir: 'dist',
    extensions: 'js',
    excludeList: ['admin'],
    minify: false,
    format: 'iife',
    recursive: false,
    tsconfig
  });

  console.log('✅ Done!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await build();
}
