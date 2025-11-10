#!/usr/bin/env node
/**
 * Copy native modules to the plugin directory for Obsidian
 * This ensures node-pty can be loaded at runtime
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'node_modules', 'node-pty');
const TARGET_DIR = path.join(__dirname, '..', 'node_modules_native', 'node-pty');

// Files and directories to copy
const ITEMS_TO_COPY = [
  'build',
  'lib',
  'package.json'
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDir(dest);
    const files = fs.readdirSync(src);

    for (const file of files) {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  console.log('Copying native modules...');

  // Ensure target directory exists
  ensureDir(TARGET_DIR);

  // Copy each item
  for (const item of ITEMS_TO_COPY) {
    const srcPath = path.join(SOURCE_DIR, item);
    const destPath = path.join(TARGET_DIR, item);

    if (fs.existsSync(srcPath)) {
      console.log(`Copying ${item}...`);
      copyRecursive(srcPath, destPath);
    } else {
      console.warn(`Warning: ${item} not found in source`);
    }
  }

  console.log('✓ Native modules copied successfully');
  console.log(`Target: ${TARGET_DIR}`);
}

main();
