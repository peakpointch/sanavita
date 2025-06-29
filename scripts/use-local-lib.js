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
  } catch (err) {
    console.error('❌ Failed to install local lib:', err);
    process.exit(1);
  }

  // Rebuild
  try {
    console.log('\n🛠️ Building with local lib.');
    execSync('npm run build --silent', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Failed to build.');
    process.exit(1);
  }

  console.log('✅ Done!');
} else {
  console.log(`✅ Already using local lib.`);
}
