#!/usr/bin/env node

/**
 * Simple packaging script using tar and native Node
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('./package.json');
const VERSION = packageJson.version;
const NAME = 'vaultly-extension';

const BUILD_DIR = __dirname;
const DIST_DIR = path.join(path.dirname(BUILD_DIR), 'dist');

console.log('📦 Creating Distribution Package\n');

// Create extension directory in dist
const extDir = path.join(DIST_DIR, `${NAME}-v${VERSION}`);

if (fs.existsSync(extDir)) {
  execSync(`rm -rf "${extDir}"`);
}

fs.mkdirSync(extDir, { recursive: true });

// Copy all files
console.log('📂 Copying files...');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Skip certain directories
    if (['node_modules', 'dist', '.git', 'build.js', 'package-extension.js', 'create-package.js'].includes(file)) {
      return;
    }

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${path.relative(BUILD_DIR, srcPath)}`);
    }
  });
}

copyDir(BUILD_DIR, extDir);

// Create tar.gz
console.log('\n🗜️  Creating tar.gz...');
const tarName = `${NAME}-v${VERSION}.tar.gz`;
const tarPath = path.join(DIST_DIR, tarName);

try {
  execSync(`cd "${DIST_DIR}" && tar -czf "${tarName}" "${NAME}-v${VERSION}"`);
  const size = fs.statSync(tarPath).size;
  console.log(`✓ ${tarName} (${(size / 1024).toFixed(2)} KB)`);
} catch (error) {
  console.error(`✗ Failed to create tar.gz: ${error.message}`);
}

// Clean up temp directory
execSync(`rm -rf "${extDir}"`);

console.log('\n✅ Package created!\n');
console.log(`📦 Location: ${DIST_DIR}`);
console.log(`📁 File: ${tarName}`);
console.log('\n📝 Next steps:');
console.log('1. Extract: tar -xzf ' + tarName);
console.log('2. Load in Chrome:');
console.log('   - chrome://extensions/');
console.log('   - Enable Developer mode');
console.log('   - Click "Load unpacked"');
console.log('   - Select the extracted folder\n');
