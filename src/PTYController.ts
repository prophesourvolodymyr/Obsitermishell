/**
 * PTY Controller
 * Manages pseudoterminal (PTY) process lifecycle and I/O
 */

import * as pty from 'node-pty';
import { IPty } from 'node-pty';
import { EventEmitter } from 'events';
import { ShellDetector } from './utils/shell-detector';

export interface PTYOptions {
	shell?: string;
	args?: string[];
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	cols?: number;
	rows?: number;
}

export class PTYController extends EventEmitter {
	private ptyProcess: IPty | null = null;
	private isAlive = false;

	constructor() {
		super();
	}

	/**
	 * Spawn a new PTY process
	 */
	public spawn(options: PTYOptions = {}): void {
		if (this.ptyProcess) {
			throw new Error('PTY process already spawned. Call kill() first.');
		}

		// Detect shell if not provided
		let shell = options.shell;
		let args = options.args;

		if (!shell) {
			const detected = ShellDetector.detectShell();
			shell = detected.shell;
			args = args || detected.args;
		}

		// Default options
		const cwd = options.cwd || process.env.HOME || process.cwd();
		const env = options.env || process.env;
		const cols = options.cols || 80;
		const rows = options.rows || 30;

		try {
			// Spawn PTY with login shell
			this.ptyProcess = pty.spawn(shell, args || [], {
				name: 'xterm-256color',
				cols,
				rows,
				cwd,
				env,
			});

			this.isAlive = true;

			// Forward data from PTY
			this.ptyProcess.onData((data: string) => {
				this.emit('data', data);
			});

			// Handle PTY exit
			this.ptyProcess.onExit(({ exitCode, signal }) => {
				this.isAlive = false;
				this.emit('exit', { exitCode, signal });
			});

			this.emit('spawn', { shell, args, cwd });
		} catch (error) {
			this.isAlive = false;
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Write data to PTY
	 */
	public write(data: string): void {
		if (!this.ptyProcess) {
			throw new Error('PTY process not spawned');
		}
		this.ptyProcess.write(data);
	}

	/**
	 * Resize PTY
	 */
	public resize(cols: number, rows: number): void {
		if (!this.ptyProcess) {
			return;
		}
		try {
			this.ptyProcess.resize(cols, rows);
		} catch (error) {
			console.error('Failed to resize PTY:', error);
		}
	}

	/**
	 * Kill PTY process
	 */
	public kill(signal?: string): void {
		if (!this.ptyProcess) {
			return;
		}

		try {
			this.ptyProcess.kill(signal);
			this.isAlive = false;
		} catch (error) {
			console.error('Failed to kill PTY:', error);
		}

		this.ptyProcess = null;
	}

	/**
	 * Check if PTY is alive
	 */
	public alive(): boolean {
		return this.isAlive;
	}

	/**
	 * Get PTY process ID
	 */
	public getPid(): number | undefined {
		return this.ptyProcess?.pid;
	}

	/**
	 * Change working directory (sends cd command)
	 */
	public changeDirectory(path: string): void {
		if (!this.isAlive) {
			return;
		}

		// Escape path for shell
		const escapedPath = path.includes(' ') ? `"${path}"` : path;

		// Send cd command
		this.write(`cd ${escapedPath}\n`);
	}

	/**
	 * Clear terminal (sends clear command)
	 */
	public clear(): void {
		if (!this.isAlive) {
			return;
		}

		// Use ANSI escape codes to clear
		this.write('\x1b[2J\x1b[3J\x1b[H');
	}
}
