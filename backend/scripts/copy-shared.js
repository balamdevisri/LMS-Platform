const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../shared/validators');
const destDir = path.join(__dirname, '../src/validators');

console.log(`[BUILD PREP] Syncing shared validators from: ${srcDir} to: ${destDir}`);

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
    console.log(`  -> Synced: ${file}`);
  });
  console.log('[BUILD PREP] Shared validators synced successfully.');
} else {
  console.warn(`[BUILD PREP] ⚠️ Warning: Shared validators source directory not found: ${srcDir}`);
}
