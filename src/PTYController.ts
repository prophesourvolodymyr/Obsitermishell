/**
 * PTY Controller - Real PTY via WebSocket Daemon
 *
 * This controller connects to the PTY daemon via WebSocket and provides
 * a clean interface for spawning and managing real PTY sessions.
 *
 * NO HACKS. NO SIMULATION. REAL PTY ONLY.
 */

import { EventEmitter } from 'events';
import { ShellDetector } from './utils/shell-detector';

export type PtyId = string;

export interface PTYOptions {
	shell?: string;
	shellArgs?: string[];
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	cols?: number;
	rows?: number;
}

interface DaemonMessage {
	type: string;
	[key: string]: any;
}

const DAEMON_PORT = 37492;
const DAEMON_HOST = '127.0.0.1';

/**
 * PTY Controller using WebSocket to communicate with PTY daemon
 */
export class PTYController extends EventEmitter {
	private ws: WebSocket | null = null;
	private ptyId: PtyId | null = null;
	private isAlive = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 3;
	private messageQueue: DaemonMessage[] = [];

	constructor() {
		super();
	}

	/**
	 * Spawn a new PTY process via the daemon
	 */
	public async spawn(options: PTYOptions = {}): Promise<void> {
		// Connect to daemon with retries
		await this.ensureDaemonConnection();

		// Detect shell if not provided
		let shell = options.shell;
		let shellArgs = options.shellArgs;

		if (!shell) {
			const detected = ShellDetector.detectShell();
			shell = detected.shell;
			shellArgs = shellArgs || detected.args;
		}

		const cwd = options.cwd || process.env.HOME || process.cwd();
		const env = options.env || process.env;
		const cols = options.cols || 80;
		const rows = options.rows || 24;

		console.log('[PTYController] Spawning PTY:', {
			shell,
			shellArgs,
			cwd: cwd.substring(0, 50) + '...',
			cols,
			rows,
		});

		// Send create message to daemon
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('PTY spawn timeout'));
			}, 5000);

			const handleCreated = (msg: DaemonMessage) => {
				if (msg.type === 'created') {
					clearTimeout(timeout);
					this.ptyId = msg.id;
					this.isAlive = true;
					console.log(`[PTYController] PTY created: ${this.ptyId}`);
					this.emit('spawn', { shell, shellArgs, cwd });
					resolve();
				} else if (msg.type === 'error') {
					clearTimeout(timeout);
					reject(new Error(msg.error));
				}
			};

			this.once('_daemon_message', handleCreated);

			this.sendToDaemon({
				type: 'create',
				shellPath: shell,
				shellArgs,
				cwd,
				env,
				cols,
				rows,
			});
		});
	}

	/**
	 * Ensure we have a daemon connection, retrying if necessary
	 */
	private async ensureDaemonConnection(): Promise<void> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return;
		}

		const maxAttempts = 5;
		const baseDelay = 300;
		let lastError: unknown;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				await this.connectToDaemon();
				return;
			} catch (error) {
				lastError = error;
				console.warn(`[PTYController] Failed to connect (attempt ${attempt}/${maxAttempts})`, error);
				await new Promise((resolve) => setTimeout(resolve, baseDelay * attempt));
			}
		}

		if (lastError instanceof Error) {
			throw lastError;
		}

		throw new Error('Failed to connect to PTY daemon');
	}

	/**
	 * Connect to PTY daemon via WebSocket
	 */
	private async connectToDaemon(): Promise<void> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return;
		}

		return new Promise((resolve, reject) => {
			const wsUrl = `ws://${DAEMON_HOST}:${DAEMON_PORT}`;
			console.log(`[PTYController] Connecting to daemon: ${wsUrl}`);

			try {
				this.ws = new WebSocket(wsUrl);

				this.ws.onopen = () => {
					console.log('[PTYController] Connected to PTY daemon');
					this.reconnectAttempts = 0;
					// Process any queued messages
					while (this.messageQueue.length > 0) {
						const msg = this.messageQueue.shift();
						if (msg) {
							this.sendToDaemon(msg);
						}
					}
					resolve();
				};

				this.ws.onmessage = (event) => {
					try {
						const msg = JSON.parse(event.data) as DaemonMessage;
						this.handleDaemonMessage(msg);
					} catch (error) {
						console.error('[PTYController] Failed to parse daemon message:', error);
					}
				};

				this.ws.onerror = (error) => {
					console.error('[PTYController] WebSocket error:', error);
					this.emit('error', new Error('PTY daemon connection error'));
				};

				this.ws.onclose = () => {
					console.log('[PTYController] Disconnected from PTY daemon');
					this.ws = null;

					// Attempt reconnect if still alive
					if (this.isAlive && this.reconnectAttempts < this.maxReconnectAttempts) {
						this.reconnectAttempts++;
						console.log(`[PTYController] Reconnecting... (attempt ${this.reconnectAttempts})`);
						setTimeout(() => this.connectToDaemon(), 1000);
					}
				};

				// Timeout if connection takes too long
				setTimeout(() => {
					if (this.ws?.readyState !== WebSocket.OPEN) {
						reject(new Error(
							'Could not connect to PTY daemon. Is the daemon running?\n' +
							`Run: cd daemon && npm start`
						));
					}
				}, 3000);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Handle message from daemon
	 */
	private handleDaemonMessage(msg: DaemonMessage): void {
		switch (msg.type) {
			case 'ready':
				console.log('[PTYController] Daemon ready');
				break;

			case 'created':
			case 'error':
				this.emit('_daemon_message', msg);
				break;

			case 'output':
				if (msg.id === this.ptyId) {
					this.emit('data', msg.data);
				}
				break;

			case 'exit':
				if (msg.id === this.ptyId) {
					this.isAlive = false;
					this.emit('exit', { exitCode: msg.code, signal: msg.signal });
				}
				break;

			default:
				console.warn('[PTYController] Unknown daemon message type:', msg.type);
		}
	}

	/**
	 * Send message to daemon
	 */
	private sendToDaemon(msg: DaemonMessage): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			// Queue the message for when we reconnect
			this.messageQueue.push(msg);
			return;
		}

		try {
			this.ws.send(JSON.stringify(msg));
		} catch (error) {
			console.error('[PTYController] Failed to send to daemon:', error);
		}
	}

	/**
	 * Write data to the PTY
	 */
	public write(data: string): void {
		if (!this.ptyId) {
			throw new Error('PTY not spawned');
		}

		this.sendToDaemon({
			type: 'data',
			id: this.ptyId,
			data,
		});
	}

	/**
	 * Resize the PTY
	 */
	public resize(cols: number, rows: number): void {
		if (!this.ptyId) {
			return;
		}

		this.sendToDaemon({
			type: 'resize',
			id: this.ptyId,
			cols,
			rows,
		});

		console.log(`[PTYController] Resized PTY to ${cols}x${rows}`);
	}

	/**
	 * Kill the PTY process
	 */
	public kill(signal?: string): void {
		if (!this.ptyId) {
			return;
		}

		this.sendToDaemon({
			type: 'kill',
			id: this.ptyId,
			signal,
		});

		this.isAlive = false;
		this.ptyId = null;

		// Close WebSocket connection
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	/**
	 * Check if PTY is alive
	 */
	public alive(): boolean {
		return this.isAlive;
	}

	/**
	 * Get PTY ID
	 */
	public getPid(): string | undefined {
		return this.ptyId || undefined;
	}

	/**
	 * Clear the terminal (send clear command)
	 */
	public clear(): void {
		if (this.isAlive) {
			if (process.platform === 'win32') {
				this.write('cls\r\n');
			} else {
				this.write('clear\r\n');
			}
		}
	}

	/**
	 * Change directory
	 */
	public changeDirectory(dir: string): void {
		if (!this.isAlive) {
			return;
		}

		const escapedDir = dir.includes(' ') ? `"${dir}"` : dir;

		if (process.platform === 'win32') {
			this.write(`cd ${escapedDir}\r\n`);
		} else {
			this.write(`cd ${escapedDir}\n`);
		}
	}
}
