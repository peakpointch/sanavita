import path from 'path';
import { findUpSync } from 'find-up';
import { execSync } from 'child_process';
import { getDevBoolean } from '../builder.js';

const root = path.dirname(findUpSync('./package.json'));
const localLibPath = path.resolve(root, '../peakflow');

let dev = getDevBoolean();
if (!dev) {
  console.log(`🔁 Switch to local lib.`);

  // Install local lib
  try {
    execSync(`npm install ${localLibPath}`, { stdio: 'inherit' });
    console.log('');
  } catch (err) {
    console.error('❌ Failed to install local lib:', err);
    process.exit(1);
  }
} else {
  console.log(`✅ Already using local lib.`);
}
