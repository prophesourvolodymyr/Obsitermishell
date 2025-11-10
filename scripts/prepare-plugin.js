#!/usr/bin/env node
/**
 * Prepare plugin for distribution
 * Copies necessary files to a dist directory ready for Obsidian
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Files to copy to dist
const FILES_TO_COPY = [
	'main.js',
	'manifest.json',
	'styles.css'  // if it exists
];

// Directories to copy
const DIRS_TO_COPY = [
	{
		src: path.join(ROOT_DIR, 'node_modules_plugin'),
		dest: 'node_modules_plugin',
		required: true
	},
	{
		src: path.join(ROOT_DIR, 'daemon'),
		dest: 'daemon',
		required: true
	},
	{
		src: path.join(ROOT_DIR, 'scripts'),
		dest: 'scripts',
		required: false  // Not critical, but helpful for rebuild
	}
];

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function copyFile(src, dest) {
	if (fs.existsSync(src)) {
		fs.copyFileSync(src, dest);
		console.log(`✓ Copied ${path.basename(src)}`);
		return true;
	}
	return false;
}

function copyDirRecursive(src, dest) {
	ensureDir(dest);
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function removeDist() {
	if (!fs.existsSync(DIST_DIR)) {
		return;
	}

	try {
		// Try with force option first
		fs.rmSync(DIST_DIR, { recursive: true, force: true, maxRetries: 3 });
	} catch (err) {
		// If that fails, try manual deletion of problematic directories
		console.warn('Standard deletion failed, trying alternative method...');
		try {
			// Remove node_modules separately if it exists
			const nodeModulesPath = path.join(DIST_DIR, 'daemon', 'node_modules');
			if (fs.existsSync(nodeModulesPath)) {
				fs.rmSync(nodeModulesPath, { recursive: true, force: true, maxRetries: 5 });
			}
			// Now try removing the whole dist again
			fs.rmSync(DIST_DIR, { recursive: true, force: true, maxRetries: 3 });
		} catch (err2) {
			console.error('Could not remove dist directory:', err2.message);
			console.error('Please manually delete the dist/ directory and try again.');
			process.exit(1);
		}
	}
}

function main() {
	console.log('Preparing plugin for distribution...\n');

	// Remove and recreate dist directory
	removeDist();
	ensureDir(DIST_DIR);

	// Copy files
	console.log('Copying files:');
	for (const file of FILES_TO_COPY) {
		const src = path.join(ROOT_DIR, file);
		const dest = path.join(DIST_DIR, file);

		if (!copyFile(src, dest) && file !== 'styles.css') {
			console.error(`✗ Required file missing: ${file}`);
			process.exit(1);
		}
	}

	// Copy directories
	console.log('\nCopying directories:');
	for (const dir of DIRS_TO_COPY) {
		const srcPath = typeof dir === 'string' ? path.join(ROOT_DIR, dir) : dir.src;
		const destPath = path.join(DIST_DIR, typeof dir === 'string' ? dir : dir.dest);

		if (fs.existsSync(srcPath)) {
			copyDirRecursive(srcPath, destPath);
			console.log(`✓ Copied ${path.basename(srcPath)}/`);
		} else if (dir.required) {
			console.error(`✗ Required directory missing: ${srcPath}`);
			console.error('  Run "npm run build" first to generate node_modules_plugin');
			process.exit(1);
		}
	}

	// Create README for dist
	const readme = `# Obsitermishell Plugin

To install this plugin in Obsidian:

1. Copy all files from this directory to:
   \`<your-vault>/.obsidian/plugins/obsitermishell/\`

2. Restart Obsidian or reload plugins

3. Enable "Obsitermishell" in Settings → Community Plugins

4. The daemon will start automatically when the plugin loads

## Files included:
- main.js: Plugin code
- manifest.json: Plugin metadata
- daemon/: PTY daemon with node-pty (auto-starts with plugin)
- node_modules_plugin/: Native modules rebuilt for Obsidian's Electron

## Architecture:
This plugin uses a real PTY daemon to bypass Electron's security restrictions:
- The daemon runs as a separate Node.js process with real PTY capabilities
- The plugin communicates with the daemon via WebSocket (localhost only)
- This provides a true terminal experience with proper TTY support

## Troubleshooting:
If you get "Terminal daemon failed to start" errors:
- Make sure the daemon/ directory was copied correctly
- Check DevTools console for daemon error messages
- Verify Node.js is installed on your system

If terminals don't work properly:
- Make sure daemon/node_modules is installed (run \`npm install\` in daemon/)
- Try rebuilding node-pty: run the rebuild script in scripts/
- Reload the plugin to restart the daemon
`;

	fs.writeFileSync(path.join(DIST_DIR, 'README.md'), readme);

	console.log('\n✓ Plugin prepared successfully!');
	console.log(`\nDistribution files are in: ${DIST_DIR}`);
	console.log('\nTo install, copy the dist/ folder contents to:');
	console.log('  <vault>/.obsidian/plugins/obsitermishell/\n');
}

main();
