/**
 * Terminal Manager
 * Manages multiple terminal sessions and their lifecycle
 */

import { EventEmitter } from 'events';
import { PTYController } from './PTYController';
import { VaultPathResolver } from './VaultPathResolver';
import { TerminalSession, TerminalSpawnOptions } from './types';
import { ShellDetector } from './utils/shell-detector';

export class TerminalManager extends EventEmitter {
	private sessions: Map<string, TerminalSession> = new Map();
	private activeSessionId: string | null = null;
	private sessionCounter = 0;
	private pathResolver: VaultPathResolver;

	constructor(pathResolver: VaultPathResolver) {
		super();
		this.pathResolver = pathResolver;
	}

	/**
	 * Create a new terminal session
	 */
	public async createSession(options: TerminalSpawnOptions = {}): Promise<TerminalSession> {
		const sessionId = this.generateSessionId();

		// Resolve working directory
		const cwdMode = options.cwdMode || 'vault';
		const cwd = options.cwd || this.pathResolver.getInitialCwd(cwdMode);

		// Create PTY controller (REAL PTY via daemon)
		const pty = new PTYController();

		// Determine shell
		const shell = options.shell || ShellDetector.detectShell().shell;
		const shellName = ShellDetector.getShellName(shell);

		// Create session
		const session: TerminalSession = {
			id: sessionId,
			name: options.profile?.name || `${shellName} ${this.sessionCounter + 1}`,
			pty,
			cwd,
			profile: options.profile,
			createdAt: new Date(),
		};

		// Spawn REAL PTY (async)
		try {
			const shellInfo = ShellDetector.detectShell();
			await pty.spawn({
				shell: options.shell || shellInfo.shell,
				shellArgs: shellInfo.args,
				cwd,
				env: options.env,
			});

			// If profile has init commands, send them
			if (options.profile?.init) {
				setTimeout(() => {
					pty.write(options.profile!.init + '\n');
				}, 100);
			}
		} catch (error) {
			console.error('Failed to spawn terminal:', error);
			this.emit('error', { sessionId, error });
			throw error;
		}

		// Listen for PTY events
		pty.on('data', (data: string) => {
			this.emit('data', { sessionId, data });
		});

		pty.on('exit', ({ exitCode, signal }: { exitCode: number; signal?: number }) => {
			this.emit('exit', { sessionId, exitCode, signal });
			this.removeSession(sessionId);
		});

		// Add to sessions
		this.sessions.set(sessionId, session);
		this.sessionCounter++;

		// Set as active if it's the first session
		if (this.sessions.size === 1) {
			this.activeSessionId = sessionId;
		}

		this.emit('session-created', session);

		return session;
	}

	/**
	 * Get a session by ID
	 */
	public getSession(sessionId: string): TerminalSession | undefined {
		return this.sessions.get(sessionId);
	}

	/**
	 * Get all sessions
	 */
	public getAllSessions(): TerminalSession[] {
		return Array.from(this.sessions.values());
	}

	/**
	 * Get active session
	 */
	public getActiveSession(): TerminalSession | null {
		if (!this.activeSessionId) {
			return null;
		}
		return this.sessions.get(this.activeSessionId) || null;
	}

	/**
	 * Set active session
	 */
	public setActiveSession(sessionId: string): void {
		if (!this.sessions.has(sessionId)) {
			throw new Error(`Session ${sessionId} not found`);
		}
		this.activeSessionId = sessionId;
		this.emit('session-activated', sessionId);
	}

	/**
	 * Remove a session
	 */
	public removeSession(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		// Kill Process if still alive
		if (session.pty.alive()) {
			session.pty.kill();
		}

		// Remove from sessions
		this.sessions.delete(sessionId);

		// If this was the active session, switch to another
		if (this.activeSessionId === sessionId) {
			const remaining = this.getAllSessions();
			this.activeSessionId = remaining.length > 0 ? remaining[0].id : null;

			if (this.activeSessionId) {
				this.emit('session-activated', this.activeSessionId);
			}
		}

		this.emit('session-removed', sessionId);
	}

	/**
	 * Resize all sessions
	 */
	public resizeAll(cols: number, rows: number): void {
		for (const session of this.sessions.values()) {
			session.pty.resize(cols, rows);
		}
	}

	/**
	 * Resize a specific session
	 */
	public resize(sessionId: string, cols: number, rows: number): void {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.pty.resize(cols, rows);
		}
	}

	/**
	 * Kill all sessions
	 */
	public killAll(): void {
		for (const session of this.sessions.values()) {
			session.pty.kill();
		}
		this.sessions.clear();
		this.activeSessionId = null;
	}

	/**
	 * Generate unique session ID
	 */
	private generateSessionId(): string {
		return `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Get session count
	 */
	public getSessionCount(): number {
		return this.sessions.size;
	}
}
