#!/usr/bin/env node
/*
 * Auto-commit watcher
 * Watches the repo for file changes and automatically commits every N changes.
 */

const path = require('path');
const chokidar = require('chokidar');
const simpleGit = require('simple-git');

const ROOT = path.resolve(__dirname, '..');
const THRESHOLD = parseInt(process.env.AUTO_COMMIT_THRESHOLD || '5', 10);
const git = simpleGit(ROOT);

let changeCount = 0;
let isCommitting = false;

const watcher = chokidar.watch(ROOT, {
  ignored: [
    /(^|\/)\.git(\/|$)/,
    /node_modules\//,
    /dist\//,
    /\.obsidian\//,
    /\.husky\//,
    /\.DS_Store$/
  ],
  ignoreInitial: true,
  persistent: true,
});

console.log('[auto-commit] Watching for file changes...');
console.log('[auto-commit] Threshold:', THRESHOLD, 'changes per commit');
console.log('[auto-commit] Press Ctrl+C to stop.');

function shouldCount(event) {
  return ['add', 'change', 'unlink', 'addDir', 'unlinkDir'].includes(event);
}

async function handleChange(event, filePath) {
  if (!shouldCount(event)) return;
  changeCount++;
  console.log(`[auto-commit] Change #${changeCount}/${THRESHOLD}: ${event} -> ${path.relative(ROOT, filePath)}`);

  if (changeCount >= THRESHOLD) {
    changeCount = 0;
    await triggerCommit();
  }
}

async function triggerCommit() {
  if (isCommitting) {
    console.log('[auto-commit] Commit already in progress, skipping.');
    return;
  }

  try {
    isCommitting = true;
    const status = await git.status();
    if (status.isClean()) {
      console.log('[auto-commit] No changes to commit.');
      return;
    }

    await git.add('.');
    const message = `[auto] checkpoint ${new Date().toISOString()}`;
    await git.commit(message);
    console.log(`[auto-commit] Committed changes with message: ${message}`);
  } catch (error) {
    console.error('[auto-commit] Failed to commit:', error.message);
  } finally {
    isCommitting = false;
  }
}

watcher.on('all', (event, filePath) => {
  handleChange(event, filePath).catch((err) => console.error(err));
});

watcher.on('error', (error) => {
  console.error('[auto-commit] Watcher error:', error);
});
