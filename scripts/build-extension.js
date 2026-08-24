#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const extensionDir = path.join(__dirname, '../extension');
const distDir = path.join(extensionDir, 'dist');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✓ Created dist directory');
}

// Copy extension files
const filesToCopy = ['manifest.json', 'background', 'content', 'popup', 'icons', 'assets'];
filesToCopy.forEach(file => {
  const src = path.join(extensionDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      execSync(`cp -r "${src}" "${dest}"`);
    } else {
      execSync(`cp "${src}" "${dest}"`);
    }
    console.log(`✓ Copied ${file}`);
  }
});

console.log('✓ Extension build complete');
