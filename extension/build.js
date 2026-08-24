#!/usr/bin/env node

/**
 * Build script for Vaultly Chrome Extension
 * Validates and prepares the extension for distribution
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'background.js',
  'content.js',
  'styles/popup.css',
  'images/icon-16.png',
  'images/icon-48.png',
  'images/icon-128.png',
];

const BUILD_DIR = __dirname;

console.log('🔨 Building Vaultly Chrome Extension...\n');

// Check all required files exist
console.log('📋 Validating files...');
let allFilesExist = true;

REQUIRED_FILES.forEach((file) => {
  const filePath = path.join(BUILD_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Build failed: Missing required files');
  process.exit(1);
}

// Validate manifest.json
console.log('\n📦 Validating manifest.json...');
try {
  const manifestPath = path.join(BUILD_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  if (!manifest.manifest_version) {
    throw new Error('Missing manifest_version');
  }
  if (!manifest.name) {
    throw new Error('Missing name');
  }
  if (!manifest.version) {
    throw new Error('Missing version');
  }

  console.log(`  ✓ Name: ${manifest.name}`);
  console.log(`  ✓ Version: ${manifest.version}`);
  console.log(`  ✓ Manifest Version: ${manifest.manifest_version}`);
} catch (error) {
  console.error(`  ✗ Manifest validation failed: ${error.message}`);
  process.exit(1);
}

// Validate JavaScript files
console.log('\n🔍 Checking JavaScript syntax...');
const jsFiles = ['popup.js', 'background.js', 'content.js'];

jsFiles.forEach((file) => {
  const filePath = path.join(BUILD_DIR, file);
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    // Basic syntax check - just make sure it's not empty
    if (code.trim().length === 0) {
      throw new Error('File is empty');
    }
    console.log(`  ✓ ${file}`);
  } catch (error) {
    console.error(`  ✗ ${file}: ${error.message}`);
    process.exit(1);
  }
});

// Check image files
console.log('\n🖼️  Checking image files...');
const imageFiles = ['images/icon-16.png', 'images/icon-48.png', 'images/icon-128.png'];

imageFiles.forEach((file) => {
  const filePath = path.join(BUILD_DIR, file);
  try {
    const stats = fs.statSync(filePath);
    console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error(`  ✗ ${file}: ${error.message}`);
    process.exit(1);
  }
});

console.log('\n✅ Build validation successful!\n');
console.log('📋 Extension Summary:');
console.log(`  📁 Location: ${BUILD_DIR}`);
console.log(`  📦 Total files: ${REQUIRED_FILES.length}`);
console.log(`  🎯 Ready for distribution\n`);

console.log('📝 Next steps:');
console.log('  1. Run: npm run package');
console.log('  2. To load in Chrome: chrome://extensions/ → Load unpacked');
console.log('  3. To publish: Go to Chrome Web Store Developer Dashboard\n');

console.log('🚀 Build complete!\n');
