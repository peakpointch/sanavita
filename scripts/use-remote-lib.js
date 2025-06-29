import { execSync } from 'child_process';
import { getDevBoolean } from '../builder.js';

// Move back if needed
let dev = getDevBoolean();
if (dev) {
  console.log('🔁 Switch to remote lib.');
} else {
  console.log('✅ Already using remote lib. Updating lib.');
}

// Reinstall
try {
  execSync('npm install github:peakpointch/peakflow.git', { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Failed to install remote lib:', err);
  process.exit(1);
}

// Rebuild
try {
  console.log('\n🛠️ Building with remote lib.');
  execSync('npm run build --silent', { stdio: 'inherit' });
  console.log('✅ Done!');
} catch (err) {
  console.error('❌ Failed to build.');
  process.exit(1);
}
