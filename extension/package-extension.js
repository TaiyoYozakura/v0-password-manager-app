#!/usr/bin/env node

/**
 * Package script for Vaultly Chrome Extension
 * Creates distributable ZIP and TAR.GZ files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('./package.json');
const VERSION = packageJson.version;
const NAME = 'vaultly-extension';

const BUILD_DIR = __dirname;
const DIST_DIR = path.join(path.dirname(BUILD_DIR), 'dist');

console.log('📦 Packaging Vaultly Chrome Extension\n');

// Create dist directory
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  console.log(`✓ Created dist directory: ${DIST_DIR}\n`);
}

// Files to include in package
const INCLUDE_PATTERNS = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'background.js',
  'content.js',
  'styles/**',
  'images/**',
  'README.md',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '*.zip',
  '*.tar.gz',
  'build.js',
  'package-extension.js',
];

console.log('📂 Collecting files...');

const filesToPackage = [];
function walkDir(dir, relativePath = '') {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relPath = path.join(relativePath, file);

    // Skip excluded patterns
    for (const exclude of EXCLUDE_PATTERNS) {
      if (relPath.includes(exclude) || relPath === exclude) {
        return;
      }
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, relPath);
    } else {
      // Check if file matches include patterns or is in included directory
      const shouldInclude = INCLUDE_PATTERNS.some((pattern) => {
        if (pattern.includes('**')) {
          const dir = pattern.split('**')[0];
          return relPath.startsWith(dir);
        }
        return relPath === pattern || relPath.endsWith('/' + pattern);
      });

      if (shouldInclude || REQUIRED_FILES.includes(relPath)) {
        filesToPackage.push({
          src: fullPath,
          dest: relPath,
        });
        console.log(`  ✓ ${relPath}`);
      }
    }
  });
}

const REQUIRED_FILES = ['manifest.json', 'popup.html', 'popup.js', 'background.js', 'content.js'];

walkDir(BUILD_DIR);

console.log(`\n✓ Total files to package: ${filesToPackage.length}\n`);

// Create ZIP archive
console.log('📦 Creating ZIP archive...');
const zipFileName = `${NAME}-v${VERSION}.zip`;
const zipPath = path.join(DIST_DIR, zipFileName);

try {
  // Use system zip command if available, otherwise create manually
  const tempDir = path.join(DIST_DIR, `.${NAME}-temp`);
  
  if (fs.existsSync(tempDir)) {
    execSync(`rm -rf ${tempDir}`);
  }
  
  fs.mkdirSync(tempDir, { recursive: true });

  // Copy files to temp directory
  filesToPackage.forEach(({ src, dest }) => {
    const destPath = path.join(tempDir, dest);
    const destDirPath = path.dirname(destPath);

    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    fs.copyFileSync(src, destPath);
  });

  // Create ZIP using system command
  const cwd = DIST_DIR;
  execSync(`cd ${cwd} && zip -r ${zipFileName} .${NAME}-temp -x ".${NAME}-temp/.*"`);

  // Cleanup temp directory
  execSync(`rm -rf ${tempDir}`);

  const zipSize = fs.statSync(zipPath).size;
  console.log(`✓ Created: ${zipFileName} (${(zipSize / 1024).toFixed(2)} KB)\n`);
} catch (error) {
  console.error(`✗ Failed to create ZIP: ${error.message}\n`);
  console.error('Note: Ensure you have `zip` command available on your system\n');
}

// Create TAR.GZ archive
console.log('📦 Creating TAR.GZ archive...');
const tarFileName = `${NAME}-v${VERSION}.tar.gz`;
const tarPath = path.join(DIST_DIR, tarFileName);

try {
  const tempDir = path.join(DIST_DIR, `.${NAME}-temp`);

  if (fs.existsSync(tempDir)) {
    execSync(`rm -rf ${tempDir}`);
  }

  fs.mkdirSync(tempDir, { recursive: true });

  // Copy files to temp directory
  filesToPackage.forEach(({ src, dest }) => {
    const destPath = path.join(tempDir, dest);
    const destDirPath = path.dirname(destPath);

    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    fs.copyFileSync(src, destPath);
  });

  // Create TAR.GZ using system command
  const cwd = DIST_DIR;
  execSync(`cd ${cwd} && tar -czf ${tarFileName} .${NAME}-temp/`);

  // Cleanup temp directory
  execSync(`rm -rf ${tempDir}`);

  const tarSize = fs.statSync(tarPath).size;
  console.log(`✓ Created: ${tarFileName} (${(tarSize / 1024).toFixed(2)} KB)\n`);
} catch (error) {
  console.error(`✗ Failed to create TAR.GZ: ${error.message}\n`);
  console.error('Note: Ensure you have `tar` command available on your system\n');
}

// Print summary
console.log('✅ Packaging complete!\n');
console.log('📋 Package Summary:');
console.log(`  📁 Location: ${DIST_DIR}`);
console.log(`  📦 Files packaged: ${filesToPackage.length}`);
console.log(`  🔖 Version: ${VERSION}`);
console.log(`  📄 Archives: ${fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.zip') || f.endsWith('.tar.gz')).length}\n`);

console.log('📝 Distribution Files:');
fs.readdirSync(DIST_DIR)
  .filter((f) => f.endsWith('.zip') || f.endsWith('.tar.gz'))
  .forEach((file) => {
    const size = fs.statSync(path.join(DIST_DIR, file)).size;
    console.log(`  📦 ${file} (${(size / 1024).toFixed(2)} KB)`);
  });

console.log('\n📝 Next steps:');
console.log(`  1. Download the archive from: ${DIST_DIR}`);
console.log('  2. For Chrome Web Store:');
console.log('     - Go to https://chromewebstore.google.com/developer/dashboard');
console.log('     - Create new item and upload the ZIP file');
console.log('  3. For manual installation:');
console.log('     - Extract the archive');
console.log('     - Go to chrome://extensions/');
console.log('     - Enable Developer mode');
console.log('     - Click "Load unpacked" and select the folder\n');

console.log('🚀 Ready for distribution!\n');
