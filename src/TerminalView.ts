/**
 * Terminal View
 * Custom Obsidian view that renders xterm.js terminal with tabs for multiple sessions
 */

import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { TerminalManager } from './TerminalManager';
import { TerminalSession } from './types';
import { ThemeManager } from './utils/theme-manager';
import { PlatformDetector } from './utils/platform-detector';

export const VIEW_TYPE_TERMINAL = 'obsitermishell-terminal';

export class TerminalView extends ItemView {
	private terminalManager: TerminalManager;
	private terminals: Map<string, Terminal> = new Map();
	private fitAddons: Map<string, FitAddon> = new Map();
	private searchAddons: Map<string, SearchAddon> = new Map();
	private containerEl: HTMLElement | null = null;
	private headerEl: HTMLElement | null = null;
	private tabsEl: HTMLElement | null = null;
	private actionsEl: HTMLElement | null = null;
	private terminalContainerEl: HTMLElement | null = null;
	private activeTerminalEl: HTMLElement | null = null;
	private resizeObserver: ResizeObserver | null = null;

	constructor(leaf: WorkspaceLeaf, terminalManager: TerminalManager) {
		super(leaf);
		this.terminalManager = terminalManager;

		// Listen to terminal manager events
		this.terminalManager.on('session-created', this.onSessionCreated.bind(this));
		this.terminalManager.on('session-removed', this.onSessionRemoved.bind(this));
		this.terminalManager.on('session-activated', this.onSessionActivated.bind(this));
		this.terminalManager.on('data', this.onData.bind(this));
	}

	getViewType(): string {
		return VIEW_TYPE_TERMINAL;
	}

	getDisplayText(): string {
		return 'Terminal';
	}

	getIcon(): string {
		return 'terminal';
	}

	async onOpen(): Promise<void> {
		// Check if on mobile
		if (PlatformDetector.getInstance().isMobile()) {
			this.renderMobileNotice();
			return;
		}

		this.renderDesktopView();
	}

	/**
	 * Render mobile notice
	 */
	private renderMobileNotice(): void {
		const container = this.containerEl.createDiv({ cls: 'obsitermishell-mobile-notice' });

		container.createDiv({ cls: 'obsitermishell-mobile-notice-icon', text: '💻' });
		container.createDiv({ cls: 'obsitermishell-mobile-notice-title', text: 'Desktop Only' });
		container.createDiv({
			cls: 'obsitermishell-mobile-notice-message',
			text: 'The terminal requires a desktop environment with a local shell. This feature is not available on mobile devices.',
		});
	}

	/**
	 * Render desktop view with terminal
	 */
	private renderDesktopView(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('obsitermishell-view');

		// Create header with tabs and actions
		this.headerEl = containerEl.createDiv({ cls: 'obsitermishell-header' });
		this.tabsEl = this.headerEl.createDiv({ cls: 'obsitermishell-tabs' });
		this.actionsEl = this.headerEl.createDiv({ cls: 'obsitermishell-actions' });

		// Add action buttons
		this.createActionButton('New', 'plus', () => this.createNewTerminal());
		this.createActionButton('Clear', 'eraser', () => this.clearActiveTerminal());

		// Create terminal container
		this.terminalContainerEl = containerEl.createDiv({ cls: 'obsitermishell-terminal-container' });

		// Create initial terminal if none exist
		if (this.terminalManager.getSessionCount() === 0) {
			this.createNewTerminal();
		} else {
			// Render existing sessions
			this.renderAllSessions();
		}

		// Set up resize observer
		this.setupResizeObserver();
	}

	/**
	 * Create action button
	 */
	private createActionButton(title: string, icon: string, onClick: () => void): void {
		const button = this.actionsEl!.createDiv({ cls: 'obsitermishell-action-button' });
		button.setAttribute('aria-label', title);
		button.innerHTML = this.getIconSvg(icon);
		button.addEventListener('click', onClick);
	}

	/**
	 * Get icon SVG (simplified - in production use Obsidian's setIcon)
	 */
	private getIconSvg(icon: string): string {
		const icons: Record<string, string> = {
			plus: '➕',
			eraser: '🧹',
			x: '✕',
		};
		return icons[icon] || icon;
	}

	/**
	 * Create new terminal session
	 */
	private createNewTerminal(): void {
		this.terminalManager.createSession();
	}

	/**
	 * Clear active terminal
	 */
	private clearActiveTerminal(): void {
		const activeSession = this.terminalManager.getActiveSession();
		if (activeSession) {
			activeSession.pty.clear();
		}
	}

	/**
	 * Render all existing sessions
	 */
	private renderAllSessions(): void {
		const sessions = this.terminalManager.getAllSessions();
		for (const session of sessions) {
			this.renderTerminal(session);
		}

		// Show active session
		const activeSession = this.terminalManager.getActiveSession();
		if (activeSession) {
			this.showTerminal(activeSession.id);
		}
	}

	/**
	 * Event handler: session created
	 */
	private onSessionCreated(session: TerminalSession): void {
		this.renderTerminal(session);
		this.renderTabs();
		this.showTerminal(session.id);
	}

	/**
	 * Event handler: session removed
	 */
	private onSessionRemoved(sessionId: string): void {
		this.destroyTerminal(sessionId);
		this.renderTabs();
	}

	/**
	 * Event handler: session activated
	 */
	private onSessionActivated(sessionId: string): void {
		this.showTerminal(sessionId);
		this.renderTabs();
	}

	/**
	 * Event handler: data from PTY
	 */
	private onData({ sessionId, data }: { sessionId: string; data: string }): void {
		const terminal = this.terminals.get(sessionId);
		if (terminal) {
			terminal.write(data);
		}
	}

	/**
	 * Render a terminal for a session
	 */
	private renderTerminal(session: TerminalSession): void {
		// Create terminal element
		const terminalEl = this.terminalContainerEl!.createDiv({ cls: 'obsitermishell-terminal' });
		terminalEl.id = `terminal-${session.id}`;
		terminalEl.style.display = 'none'; // Hidden by default

		// Create xterm.js Terminal
		const terminal = new Terminal({
			cursorBlink: true,
			fontSize: 14,
			fontFamily: 'Menlo, Monaco, "Courier New", monospace',
			theme: ThemeManager.getObsidianTheme(),
			scrollback: 10000,
		});

		// Load addons
		const fitAddon = new FitAddon();
		terminal.loadAddon(fitAddon);

		const searchAddon = new SearchAddon();
		terminal.loadAddon(searchAddon);

		const webLinksAddon = new WebLinksAddon();
		terminal.loadAddon(webLinksAddon);

		// Open terminal in DOM
		terminal.open(terminalEl);

		// Fit to container
		fitAddon.fit();

		// Handle terminal input -> PTY
		terminal.onData((data) => {
			session.pty.write(data);
		});

		// Handle resize
		terminal.onResize(({ cols, rows }) => {
			session.pty.resize(cols, rows);
		});

		// Store references
		this.terminals.set(session.id, terminal);
		this.fitAddons.set(session.id, fitAddon);
		this.searchAddons.set(session.id, searchAddon);
	}

	/**
	 * Destroy terminal
	 */
	private destroyTerminal(sessionId: string): void {
		const terminal = this.terminals.get(sessionId);
		if (terminal) {
			terminal.dispose();
			this.terminals.delete(sessionId);
		}

		this.fitAddons.delete(sessionId);
		this.searchAddons.delete(sessionId);

		// Remove DOM element
		const terminalEl = document.getElementById(`terminal-${sessionId}`);
		if (terminalEl) {
			terminalEl.remove();
		}
	}

	/**
	 * Show terminal for a session
	 */
	private showTerminal(sessionId: string): void {
		// Hide all terminals
		for (const [id, terminal] of this.terminals.entries()) {
			const el = document.getElementById(`terminal-${id}`);
			if (el) {
				el.style.display = id === sessionId ? 'block' : 'none';
			}
		}

		// Fit active terminal
		const fitAddon = this.fitAddons.get(sessionId);
		if (fitAddon) {
			setTimeout(() => fitAddon.fit(), 0);
		}

		// Focus active terminal
		const terminal = this.terminals.get(sessionId);
		if (terminal) {
			terminal.focus();
		}
	}

	/**
	 * Render tabs
	 */
	private renderTabs(): void {
		if (!this.tabsEl) return;

		this.tabsEl.empty();

		const sessions = this.terminalManager.getAllSessions();
		const activeSession = this.terminalManager.getActiveSession();

		for (const session of sessions) {
			const tab = this.tabsEl.createDiv({ cls: 'obsitermishell-tab' });

			if (activeSession?.id === session.id) {
				tab.addClass('active');
			}

			// Tab name
			tab.createSpan({ text: session.name });

			// Close button
			const closeBtn = tab.createSpan({ cls: 'obsitermishell-tab-close', text: '✕' });
			closeBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.terminalManager.removeSession(session.id);
			});

			// Click to activate
			tab.addEventListener('click', () => {
				this.terminalManager.setActiveSession(session.id);
			});
		}
	}

	/**
	 * Set up resize observer
	 */
	private setupResizeObserver(): void {
		if (!this.terminalContainerEl) return;

		this.resizeObserver = new ResizeObserver(() => {
			// Refit all terminals
			for (const fitAddon of this.fitAddons.values()) {
				fitAddon.fit();
			}
		});

		this.resizeObserver.observe(this.terminalContainerEl);
	}

	/**
	 * Update theme for all terminals
	 */
	public updateTheme(): void {
		const theme = ThemeManager.getObsidianTheme();
		for (const terminal of this.terminals.values()) {
			terminal.options.theme = theme;
		}
	}

	async onClose(): Promise<void> {
		// Clean up resize observer
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}

		// Dispose all terminals
		for (const terminal of this.terminals.values()) {
			terminal.dispose();
		}

		this.terminals.clear();
		this.fitAddons.clear();
		this.searchAddons.clear();

		// Kill all PTY sessions
		this.terminalManager.killAll();
	}
}
