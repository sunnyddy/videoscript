// increment-version.js
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const version = pkg.version;

// Split into [major, minor, patch]
const parts = version.split('.');
if (parts.length !== 3) {
  console.error('❌ Version must be in MAJOR.MINOR.PATCH format (e.g., 1.0.23)');
  process.exit(1);
}

let [major, minor, patch] = parts.map(Number);

// Validate numbers
if ([major, minor, patch].some(isNaN)) {
  console.error('❌ Invalid version number components:', version);
  process.exit(1);
}

// Increment PATCH by 1
patch += 1;

const newVersion = `${major}.${minor}.${patch}`;

console.log(`🔖 Updating version from ${version} to ${newVersion}`);

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
