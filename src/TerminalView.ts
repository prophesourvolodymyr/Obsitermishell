/**
 * Terminal View
 * Custom Obsidian view that renders xterm.js terminal with tabs for multiple sessions
 */

import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { TerminalManager } from './TerminalManager';
import { TerminalSession, ObsitermishellSettings, TerminalTheme, CursorAnimationStyle, TerminalProfile } from './types';
import { ThemeManager } from './utils/theme-manager';
import { PlatformDetector } from './utils/platform-detector';
import { ensureXtermStylesInjected } from './utils/style-injector';
import { getThemePreset } from './utils/theme-presets';
import { applyUITheme, removeUITheme } from './utils/ui-theme-injector';

export const VIEW_TYPE_TERMINAL = 'obsitermishell-terminal';

type Disposable = { dispose: () => void };

interface CursorOverlayState {
	wrapper: HTMLElement;
	inner: HTMLElement;
	disposables: Disposable[];
}

export class TerminalView extends ItemView {
	private terminalManager: TerminalManager;
	private settings: ObsitermishellSettings;
	private terminals: Map<string, Terminal> = new Map();
	private fitAddons: Map<string, FitAddon> = new Map();
	private searchAddons: Map<string, SearchAddon> = new Map();
	private headerEl: HTMLElement | null = null;
	private tabsEl: HTMLElement | null = null;
	private actionsEl: HTMLElement | null = null;
	private terminalContainerEl: HTMLElement | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private bannerEls: Map<string, HTMLElement> = new Map();
	private guideOverlayEl: HTMLElement | null = null;
	private guideDismissed = false;
	private cursorOverlays: Map<string, CursorOverlayState> = new Map();
	private profileSelectEl: HTMLSelectElement | null = null;
	private firstCommandCaptured: Map<string, boolean> = new Map();
	private commandBuffers: Map<string, string> = new Map();

	constructor(leaf: WorkspaceLeaf, terminalManager: TerminalManager, settings: ObsitermishellSettings) {
		super(leaf);
		this.terminalManager = terminalManager;
		this.settings = settings;
		ensureXtermStylesInjected();

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
		this.applyUITheming();
		this.applyTerminalBackground();
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
		this.createActionButton('Settings', 'gear', () => this.openPluginSettings());
		this.renderProfileDropdown();

		this.renderGuideOverlay();

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

	private renderProfileDropdown(): void {
		if (!this.actionsEl) return;
		if (this.profileSelectEl) {
			this.profileSelectEl.remove();
			this.profileSelectEl = null;
		}

		const select = this.actionsEl.createEl('select', { cls: 'obsitermishell-profile-select' });
		const placeholder = select.createEl('option', { text: 'Profiles' });
		placeholder.value = '';
		placeholder.selected = true;
		placeholder.disabled = true;

		for (const profile of this.settings.profiles) {
			const option = select.createEl('option', { text: profile.name });
			option.value = profile.id;
		}

		select.addEventListener('change', async (evt) => {
			const value = (evt.target as HTMLSelectElement).value;
			if (!value) return;

			const profile = this.settings.profiles.find((p) => p.id === value);
			if (!profile) {
				new Notice('Profile not found.');
				return;
			}

			try {
				await this.terminalManager.createSession({
					profile,
					cwdMode: profile.cwdMode,
				});
			} catch (error) {
				console.error('Failed to create profile terminal', error);
				new Notice('Failed to launch profile terminal.');
			} finally {
				select.value = '';
			}
		});

		this.profileSelectEl = select;
	}

	/**
	 * Get icon SVG (simplified - in production use Obsidian's setIcon)
	 */
	private getIconSvg(icon: string): string {
		const icons: Record<string, string> = {
			plus: '➕',
			eraser: '🧹',
			gear: '⚙️',
			x: '✕',
		};
		return icons[icon] || icon;
	}

	/**
	 * Open plugin settings
	 */
	private openPluginSettings(): void {
		// @ts-ignore - accessing internal Obsidian API
		this.app.setting.open();
		// @ts-ignore
		this.app.setting.openTabById('obsitermishell');
	}

	/**
	 * Create new terminal session
	 */
	private async createNewTerminal(): Promise<void> {
		try {
			await this.terminalManager.createSession();
		} catch (error) {
			console.error('Failed to create terminal:', error);
			// Show user-friendly error
			const errorDiv = this.terminalContainerEl!.createDiv({
				cls: 'obsitermishell-error',
			});
			errorDiv.createEl('h3', { text: '❌ Failed to start terminal' });
			errorDiv.createEl('p', {
				text: error instanceof Error ? error.message : 'Unknown error',
			});
			errorDiv.createEl('p', {
				text: 'Make sure the PTY daemon is running:',
			});
			errorDiv.createEl('code', {
				text: 'cd daemon && npm start',
			});
		}
	}

	/**
	 * Clear active terminal
	 */
	private clearActiveTerminal(): void {
		const activeSession = this.terminalManager.getActiveSession();
		if (activeSession) {
			// Get the xterm.js terminal instance
			const terminal = this.terminals.get(activeSession.id);
			if (terminal) {
				// Clear the terminal display buffer
				terminal.clear();
				// Also clear scrollback
				terminal.clearSelection();
			}
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
		// Create terminal wrapper with banner
		const wrapperEl = this.terminalContainerEl!.createDiv({ cls: 'obsitermishell-terminal-wrapper' });
		wrapperEl.id = `terminal-${session.id}`;
		wrapperEl.style.display = 'none'; // Hidden by default

		const bannerEl = wrapperEl.createDiv({ cls: 'obsitermishell-terminal-banner' });
		this.bannerEls.set(session.id, bannerEl);

		const terminalEl = wrapperEl.createDiv({ cls: 'obsitermishell-terminal-host' });

		// Create xterm.js Terminal for REAL PTY
		const fontSize = Math.max(10, this.settings.fontSize || 14);
		const scrollback = Math.max(1000, this.settings.scrollback || 10000);

		const terminal = new Terminal({
			cursorBlink: true,
			fontSize,
			fontFamily: 'Menlo, Monaco, "Courier New", monospace',
			theme: ThemeManager.getObsidianTheme(),
			scrollback,
			// No special EOL conversion - PTY handles it properly
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
		this.applyCursorOptions(terminal, session.id);

		// Fit to container
		fitAddon.fit();

		this.renderBanner(session.id);
		requestAnimationFrame(() => {
			this.initializeCursorOverlay(session.id, terminal, terminalEl);
		});

		// Handle terminal input -> REAL PTY
		// NO ECHOING - real PTY handles this automatically
		terminal.onData((data) => {
			session.pty.write(data);

			// Capture first command for tab naming
			if (!this.firstCommandCaptured.get(session.id)) {
				const buffer = this.commandBuffers.get(session.id) || '';

				// Check if Enter key was pressed
				if (data === '\r' || data === '\n') {
					if (buffer.trim().length > 0) {
						// Update session name with first command
						const firstCommand = buffer.trim().split(' ')[0]; // Just the command, not args
						session.name = firstCommand;
						this.firstCommandCaptured.set(session.id, true);
						this.commandBuffers.delete(session.id);
						this.renderTabs(); // Re-render tabs with new name
					}
				} else if (data === '\x7f' || data === '\b') {
					// Backspace - remove last character
					this.commandBuffers.set(session.id, buffer.slice(0, -1));
				} else if (data.charCodeAt(0) >= 32 || data === '\t') {
					// Printable character or tab - add to buffer
					this.commandBuffers.set(session.id, buffer + data);
				}
			}
		});

		// Focus terminal when clicked
		terminalEl.addEventListener('click', () => {
			terminal.focus();
		});

		// Auto-focus on first terminal
		setTimeout(() => {
			terminal.focus();
		}, 100);

		// Handle resize
		terminal.onResize(({ cols, rows }) => {
			// Only resize if PTY is still alive
			if (session.pty.alive()) {
				session.pty.resize(cols, rows);
			}
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

		this.disposeCursorOverlay(sessionId);
		this.bannerEls.delete(sessionId);
		this.fitAddons.delete(sessionId);
		this.searchAddons.delete(sessionId);
		this.firstCommandCaptured.delete(sessionId);
		this.commandBuffers.delete(sessionId);

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
		for (const [id] of this.terminals.entries()) {
			const el = document.getElementById(`terminal-${id}`);
			if (el) {
				el.style.display = id === sessionId ? 'block' : 'none';
			}
		}

		// Fit and focus active terminal
		const fitAddon = this.fitAddons.get(sessionId);
		const terminal = this.terminals.get(sessionId);

		if (fitAddon && terminal) {
			setTimeout(() => {
				fitAddon.fit();
				terminal.focus();
				this.renderBanner(sessionId);
				this.updateCursorOverlayStyle(sessionId);
				this.updateCursorOverlay(sessionId);
			}, 50);
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

			const activeSession = this.terminalManager.getActiveSession();
			if (activeSession) {
				this.renderBanner(activeSession.id);
			}
		});

		this.resizeObserver.observe(this.terminalContainerEl);
	}

	private renderGuideOverlay(): void {
		if (this.guideDismissed || this.guideOverlayEl) return;

		this.guideOverlayEl = this.containerEl.createDiv({ cls: 'obsitermishell-guide-overlay' });
		this.guideOverlayEl.createEl('p', {
			cls: 'obsitermishell-guide-title',
			text: 'Quick tour of the terminal header',
		});

		const cardsWrap = this.guideOverlayEl.createDiv({ cls: 'obsitermishell-guide-cards' });
		const cards = [
			{
				title: 'Tabs',
				body: 'Switch between sessions or close them with the ✕ button.',
			},
			{
				title: '"New"',
				body: 'Open another terminal pane instantly.',
			},
			{
				title: '"Clear"',
				body: 'Wipe the output buffer and send a clear command to the shell.',
			},
		];

		for (const card of cards) {
			const cardEl = cardsWrap.createDiv({ cls: 'obsitermishell-guide-card' });
			cardEl.createEl('strong', { text: card.title });
			cardEl.createEl('p', { text: card.body });
		}

		const dismissBtn = this.guideOverlayEl.createEl('button', {
			text: 'Got it',
		});
		dismissBtn.addClass('obsitermishell-guide-dismiss');
		dismissBtn.addEventListener('click', () => {
			this.guideDismissed = true;
			this.guideOverlayEl?.remove();
			this.guideOverlayEl = null;
		});
	}

	private renderBanner(sessionId: string): void {
		const bannerEl = this.bannerEls.get(sessionId);
		if (!bannerEl) return;

		bannerEl.empty();

		if (!this.settings.showWelcomeBanner) {
			bannerEl.addClass('is-hidden');
			return;
		}

		bannerEl.removeClass('is-hidden');

		const width = bannerEl.clientWidth || this.terminalContainerEl?.clientWidth || 600;
		const logo = this.getBannerLogo(width);

		bannerEl.createEl('pre', {
			cls: 'obsitermishell-banner-logo',
			text: logo,
		});

		const tagline = 'Real PTY for Obsidian · Desktop only · Press Cmd+P (mac) / Ctrl+Shift+P (win/linux)';
		bannerEl.createDiv({
			cls: 'obsitermishell-banner-tagline',
			text: tagline,
		});

		this.addBannerSeparator(bannerEl);

		// Combine all links and action buttons in one container
		const linksEl = bannerEl.createDiv({ cls: 'obsitermishell-banner-links' });

		// Add regular links
		const links = this.getBannerLinks();
		for (const link of links) {
			const anchor = linksEl.createEl('a', {
				cls: 'obsitermishell-banner-link',
				text: `[${link.label}]`,
			});
			anchor.href = link.url;
			anchor.target = '_blank';
			anchor.rel = 'noopener noreferrer';
		}

		// Add action buttons
		const customizeBtn = linksEl.createEl('button', {
			cls: 'obsitermishell-banner-link',
			text: '[Customize]',
		});
		customizeBtn.addEventListener('click', () => {
			this.openPluginSettings();
		});

		const reportBugBtn = linksEl.createEl('a', {
			cls: 'obsitermishell-banner-link',
			text: '[Report Bug]',
		});
		reportBugBtn.href = 'https://github.com/yourusername/obsitermishell/issues';
		reportBugBtn.target = '_blank';
		reportBugBtn.rel = 'noopener noreferrer';

		this.addBannerSeparator(bannerEl);
	}

	private addBannerSeparator(container: HTMLElement): void {
		container.createDiv({ cls: 'obsitermishell-banner-separator' });
	}

	private getBannerLinks(): { label: string; url: string }[] {
		const links = [];

		// Add coffee link only if setting is enabled
		if (this.settings.showCoffeeBanner && this.settings.donationLink) {
			links.push({ label: 'Buy me a coffee ☕', url: this.settings.donationLink });
		}

		// Add other links
		if (this.settings.workWithMeLink && this.settings.workWithMeLink.trim().length > 0) {
			links.push({ label: 'Work With Me', url: this.settings.workWithMeLink });
		}
		if (this.settings.websiteLink && this.settings.websiteLink.trim().length > 0) {
			links.push({ label: 'Website', url: this.settings.websiteLink });
		}

		return links;
	}

	private getBannerLogo(width: number): string {
		const fullLogo = [
			'   ____  ___________',
			'  / __ \\/_  __/ ___/',
			' / / / / / /  \\__ \\',
			'/ /_/ / / /  ___/ /',
			'\\____/ /_/  /____/',
		].join('\n');

		if (width >= 520) {
			return fullLogo;
		}

		const compactLogo = ['  ___', ' / _ \\', '| | | |', '| |_| |', ' \\___/'].join('\n');
		return compactLogo;
	}

	private initializeCursorOverlay(sessionId: string, terminal: Terminal, hostEl: HTMLElement): void {
		if (this.cursorOverlays.has(sessionId)) return;
		const screen = hostEl.querySelector('.xterm-screen') as HTMLElement | null;
		if (!screen) return;

		const wrapper = document.createElement('div');
		wrapper.className = 'obsitermishell-cursor-overlay';
		const inner = document.createElement('div');
		inner.className = 'obsitermishell-cursor-overlay-inner';
		wrapper.appendChild(inner);
		screen.appendChild(wrapper);

		const update = () => {
			this.updateCursorOverlay(sessionId);
		};

		const disposables: Disposable[] = [
			terminal.onRender(update),
			terminal.onCursorMove(update),
			terminal.onScroll(update),
			terminal.onResize(() => this.updateCursorOverlay(sessionId)),
		];

		this.cursorOverlays.set(sessionId, { wrapper, inner, disposables });
		this.updateCursorOverlayStyle(sessionId);
		this.updateCursorOverlay(sessionId);
	}

	private disposeCursorOverlay(sessionId: string): void {
		const overlay = this.cursorOverlays.get(sessionId);
		if (!overlay) return;
		for (const disposable of overlay.disposables) {
			disposable.dispose();
		}
		overlay.wrapper.remove();
		this.cursorOverlays.delete(sessionId);
	}

	private updateCursorOverlayStyle(sessionId: string): void {
		const overlay = this.cursorOverlays.get(sessionId);
		if (!overlay) return;
		const animation = this.getCursorAnimation();
		const accent = this.getCursorAccentColor();
		overlay.wrapper.classList.toggle('active', animation !== 'classic');
		overlay.inner.className = `obsitermishell-cursor-overlay-inner cursor-${animation}`;
		overlay.inner.style.setProperty('--cursor-accent', accent);
	}

	private updateCursorOverlay(sessionId: string): void {
		const overlay = this.cursorOverlays.get(sessionId);
		if (!overlay) return;
		const animation = this.getCursorAnimation();
		if (animation === 'classic') {
			overlay.wrapper.style.opacity = '0';
			return;
		}

		const terminal = this.terminals.get(sessionId);
		const core = (terminal as any)?._core;
		const renderer = core?._renderService;
		const dims = renderer?.dimensions?.css?.cell;
		if (!terminal || !core || !dims) return;

		const cursorX = core.buffer.x;
		const viewportY = core.buffer.y - core.buffer.ydisp;
		const x = cursorX * dims.width;
		const y = viewportY * dims.height;
		overlay.wrapper.style.transform = `translate(${x}px, ${y}px)`;
		overlay.wrapper.style.width = `${dims.width}px`;
		overlay.wrapper.style.height = `${dims.height}px`;
		overlay.wrapper.style.opacity = '1';
	}

	private getCursorAccentColor(): string {
		const custom = this.settings.cursorAccent?.trim();
		if (custom) return custom;
		const theme = ThemeManager.getObsidianTheme();
		return theme.cursor || '#7bf7a4';
	}

	private getCursorAnimation(): CursorAnimationStyle {
		return this.settings.cursorAnimation || 'classic';
	}

	private buildTheme(): TerminalTheme {
		// Check if a theme preset is active
		const presetId = this.settings.activeThemePreset;
		if (presetId && presetId !== 'custom' && presetId !== 'obsidian') {
			const preset = getThemePreset(presetId);
			if (preset) {
				// Use preset theme
				const theme = { ...preset.theme };
				// Make background transparent if custom image is set
				if (this.settings.backgroundImage) {
					theme.background = 'transparent';
				}
				return theme;
			}
		}

		// Fall back to Obsidian adaptive theme or custom settings
		const baseTheme = ThemeManager.getObsidianTheme();
		const theme: TerminalTheme = { ...baseTheme };

		// Apply custom overrides
		if (this.settings.cursorAccent && this.settings.cursorAccent.trim().length > 0) {
			theme.cursor = this.settings.cursorAccent;
		}
		if (this.settings.terminalForeground && this.settings.terminalForeground.trim().length > 0) {
			theme.foreground = this.settings.terminalForeground;
		}
		if (this.settings.terminalBackground && this.settings.terminalBackground.trim().length > 0) {
			theme.background = this.settings.terminalBackground;
		}

		// Make background transparent if custom image is set
		if (this.settings.backgroundImage) {
			theme.background = 'transparent';
		}

		return theme;
	}

	private applyCursorOptions(terminal: Terminal, sessionId: string): void {
		const animation = this.getCursorAnimation();
		const theme = this.buildTheme();
		if (animation !== 'classic') {
			theme.cursor = '#00000000';
			terminal.options.cursorBlink = false;
			terminal.options.cursorStyle = 'block';
		} else {
			terminal.options.cursorBlink = typeof this.settings.cursorBlink === 'boolean' ? this.settings.cursorBlink : true;
			terminal.options.cursorStyle = this.settings.cursorStyle || 'block';
		}
		terminal.options.theme = theme;
		this.updateCursorOverlayStyle(sessionId);
		this.updateCursorOverlay(sessionId);
	}

	public updateCursorAppearance(): void {
		for (const [sessionId, terminal] of this.terminals.entries()) {
			this.applyCursorOptions(terminal, sessionId);
		}
	}


	/**
	 * Show welcome banner with ASCII art
	 */
	/**
	 * Update theme for all terminals and UI
	 */
	public updateTheme(): void {
		this.updateCursorAppearance();
		this.applyUITheming();
		this.applyTerminalBackground();
	}

	/**
	 * Apply UI theming from preset
	 */
	private applyUITheming(): void {
		const presetId = this.settings.activeThemePreset;
		if (presetId && presetId !== 'custom' && presetId !== 'obsidian') {
			const preset = getThemePreset(presetId);
			if (preset && preset.uiColors) {
				applyUITheme(preset.uiColors);
				return;
			}
		}
		// Remove custom theming if using Obsidian or custom mode
		removeUITheme();
	}

	/**
	 * Apply background image to terminal
	 */
	private applyTerminalBackground(): void {
		if (!this.terminalContainerEl) return;

		const backgroundImage = this.settings.backgroundImage;
		const opacity = this.settings.backgroundOpacity;

		if (backgroundImage) {
			// Apply background image with opacity using CSS custom properties
			this.terminalContainerEl.style.setProperty('--bg-image', `url(${backgroundImage})`);
			this.terminalContainerEl.style.setProperty('--bg-opacity', String(opacity));
			this.terminalContainerEl.addClass('has-custom-background');
		} else {
			// Remove background
			this.terminalContainerEl.style.removeProperty('--bg-image');
			this.terminalContainerEl.style.removeProperty('--bg-opacity');
			this.terminalContainerEl.removeClass('has-custom-background');
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
		for (const [sessionId] of this.cursorOverlays) {
			this.disposeCursorOverlay(sessionId);
		}
		this.cursorOverlays.clear();
		this.bannerEls.clear();

		// Kill all PTY sessions
		this.terminalManager.killAll();
	}
}
