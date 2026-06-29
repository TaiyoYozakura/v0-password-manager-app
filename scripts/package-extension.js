#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('../package.json');
const version = packageJson.version;
const extensionDir = path.join(__dirname, '../extension');
const distDir = path.join(extensionDir, 'dist');
const releaseDir = path.join(__dirname, '../release');

// Ensure release directory exists
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const zipName = `Vaultly-Extension-v${version}.zip`;
const tarName = `Vaultly-Extension-v${version}.tar.gz`;
const zipPath = path.join(releaseDir, zipName);
const tarPath = path.join(releaseDir, tarName);

try {
  // Create ZIP
  process.chdir(distDir);
  execSync(`zip -r "${zipPath}" . -x "*.git*"`);
  console.log(`✓ Created ${zipName}`);

  // Create TAR.GZ
  execSync(`tar -czf "${tarPath}" .`);
  console.log(`✓ Created ${tarName}`);

  console.log(`\n✓ Release artifacts ready in ${releaseDir}/`);
  console.log(`  - ${zipName}`);
  console.log(`  - ${tarName}`);
} catch (error) {
  console.error('Error packaging extension:', error.message);
  process.exit(1);
}
