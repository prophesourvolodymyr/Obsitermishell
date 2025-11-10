#!/usr/bin/env node
/**
 * Test script to verify NodeFinder will work
 * Run: node scripts/test-node-finder.js
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { platform } = require('os');

console.log('Testing Node.js detection for Obsitermishell daemon...\n');

// Get common paths
function getCommonNodePaths() {
  const os = platform();
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  if (os === 'darwin') {
    return [
      '/usr/local/bin/node',
      '/opt/homebrew/bin/node',
      `${homeDir}/.nvm/versions/node/v20.0.0/bin/node`,
      `${homeDir}/.nvm/versions/node/v18.0.0/bin/node`,
      '/usr/bin/node',
    ];
  } else if (os === 'win32') {
    return [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
    ];
  } else {
    return [
      '/usr/bin/node',
      '/usr/local/bin/node',
      `${homeDir}/.nvm/versions/node/v20.0.0/bin/node`,
    ];
  }
}

// Test 1: Check common paths
console.log('Test 1: Checking common Node.js paths...');
const commonPaths = getCommonNodePaths();
let foundPath = null;

for (const path of commonPaths) {
  if (existsSync(path)) {
    console.log(`  ✓ Found: ${path}`);
    foundPath = path;
    break;
  } else {
    console.log(`  ✗ Not found: ${path}`);
  }
}

if (foundPath) {
  // Test 2: Verify node works
  console.log(`\nTest 2: Verifying Node.js at ${foundPath}...`);
  try {
    const version = execSync(`"${foundPath}" --version`, { encoding: 'utf8' }).trim();
    console.log(`  ✓ Node version: ${version}`);
    console.log(`\n✅ SUCCESS: Daemon will use ${foundPath}`);
  } catch (err) {
    console.log(`  ✗ Error running node: ${err.message}`);
  }
} else {
  // Test 3: Try which/where command
  console.log('\nTest 3: Trying which/where command...');
  try {
    const command = platform() === 'win32' ? 'where node' : 'which node';
    const result = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim();
    const nodePath = result.split('\n')[0].trim();

    console.log(`  ✓ Found via ${command}: ${nodePath}`);

    const version = execSync(`"${nodePath}" --version`, { encoding: 'utf8' }).trim();
    console.log(`  ✓ Node version: ${version}`);
    console.log(`\n✅ SUCCESS: Daemon will use ${nodePath}`);
  } catch (err) {
    console.log(`  ✗ Could not find node: ${err.message}`);
    console.log('\n❌ FAILURE: Node.js not found!');
    console.log('\nPlease install Node.js:');
    console.log('  macOS: brew install node');
    console.log('  Windows: https://nodejs.org/');
    console.log('  Linux: apt install nodejs (or yum/dnf)');
    process.exit(1);
  }
}

console.log('\n---');
console.log('This test simulates what the DaemonManager will do when starting.');
console.log('If this test passes, the daemon should start successfully in Obsidian.\n');
