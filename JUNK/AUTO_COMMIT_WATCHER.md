# Auto Commit Watcher

## What it does

`scripts/auto-commit-watcher.js` uses **chokidar** to watch the repository and **simple-git** to run `git add` + `git commit`. Every time it detects file events (add/change/delete), it increments a counter. When the counter reaches the threshold (default 5), it automatically stages all files and creates a commit with a timestamped message (`[auto] checkpoint <ISO time>`).

## How to run

```bash
npm install   # ensures chokidar & simple-git are available
npm run auto-commit
```

The script keeps running until you press `Ctrl+C`. You’ll see logs for each detected change and every automatic commit.

## Configuration

- Threshold: set `AUTO_COMMIT_THRESHOLD=<number>` before the command to change the number of changes required per commit.

  ```bash
  AUTO_COMMIT_THRESHOLD=3 npm run auto-commit
  ```

## Notes & cautions

- The watcher ignores `.git`, `node_modules`, `dist`, `.obsidian`, and `.husky` folders to avoid loops.
- Commits happen on the current branch, so make sure you’re in the correct branch before running it.
- This is a convenience tool for rapid checkpoints; you can still create manual commits whenever you want.
