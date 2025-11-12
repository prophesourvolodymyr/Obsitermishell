/**
 * Obsitermishell Main Plugin
 * Embedded terminal for Obsidian Desktop
 */

import { Plugin, WorkspaceLeaf, TFile, Notice } from 'obsidian';
import { TerminalView, VIEW_TYPE_TERMINAL } from './TerminalView';
import { TerminalManager } from './TerminalManager';
import { VaultPathResolver } from './VaultPathResolver';
import { ObsitermishellSettingTab } from './SettingsTab';
import { ObsitermishellSettings, DEFAULT_SETTINGS, CwdMode } from './types';
import { PlatformDetector } from './utils/platform-detector';
import { DaemonManager } from './DaemonManager';

export default class ObsitermishellPlugin extends Plugin {
	settings!: ObsitermishellSettings;
	terminalManager!: TerminalManager;
	pathResolver!: VaultPathResolver;
	daemonManager!: DaemonManager;
	private autoCdEnabled = false;

	async onload() {
		console.log('Loading Obsitermishell plugin (using real PTY daemon)');

		// Load settings
		await this.loadSettings();

		// Initialize daemon manager
		const pluginDir = (this.app.vault.adapter as any).getBasePath() + '/' + this.manifest.dir;
		this.daemonManager = new DaemonManager(pluginDir);

		// Start PTY daemon
		try {
			await this.daemonManager.start();
			console.log('PTY daemon started successfully');
		} catch (err) {
			console.error('Failed to start PTY daemon:', err);
			new Notice('Failed to start terminal daemon. Terminal functionality will not work.');
		}

		// Initialize path resolver
		this.pathResolver = new VaultPathResolver(this.app);

		// Initialize terminal manager
		this.terminalManager = new TerminalManager(this.pathResolver);

		// Register terminal view
		this.registerView(VIEW_TYPE_TERMINAL, (leaf) => new TerminalView(leaf, this.terminalManager, this.settings));

		// Add ribbon icon
		this.addRibbonIcon('terminal', 'Open Terminal', () => {
			this.activateTerminalView();
		});

		// Register commands
		this.registerCommands();

		// Add settings tab
		this.addSettingTab(new ObsitermishellSettingTab(this.app, this));

		// Set up file-open event listener for auto-cd
		this.setupAutoCd();

		// Set up theme change listener
		this.setupThemeListener();

		// Show notice if on mobile
		if (PlatformDetector.getInstance().isMobile()) {
			new Notice('Obsitermishell: Terminal is only available on desktop');
		}
	}

	async onunload() {
		console.log('Unloading Obsitermishell plugin');

		// Kill all terminal sessions
		this.terminalManager.killAll();

		// Stop PTY daemon
		await this.daemonManager.stop();

		// Detach terminal views
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TERMINAL);
	}

	/**
	 * Register plugin commands
	 */
	private registerCommands(): void {
		// Open Terminal
		this.addCommand({
			id: 'open-terminal',
			name: 'Open Terminal',
			callback: () => {
				this.activateTerminalView();
			},
		});

		// New Terminal
		this.addCommand({
			id: 'new-terminal',
			name: 'New Terminal',
			callback: () => {
				this.createNewTerminal();
			},
		});

		// New Terminal with Profile
		this.addCommand({
			id: 'new-terminal-with-profile',
			name: 'New Terminal with Profile...',
			callback: () => {
				this.showProfilePicker();
			},
		});

		// Clear Terminal
		this.addCommand({
			id: 'clear-terminal',
			name: 'Clear Terminal',
			callback: () => {
				const activeSession = this.terminalManager.getActiveSession();
				if (activeSession) {
					activeSession.pty.clear();
				}
			},
		});

		// Toggle Auto-CD
		this.addCommand({
			id: 'toggle-auto-cd',
			name: 'Toggle Auto-CD',
			callback: () => {
				this.autoCdEnabled = !this.autoCdEnabled;
				new Notice(`Auto-CD ${this.autoCdEnabled ? 'enabled' : 'disabled'}`);
			},
		});

		// Focus Terminal
		this.addCommand({
			id: 'focus-terminal',
			name: 'Focus Terminal',
			callback: () => {
				this.activateTerminalView();
			},
		});
	}

	/**
	 * Activate terminal view
	 */
	async activateTerminalView(): Promise<void> {
		const { workspace } = this.app;

		// Check if terminal view already exists
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TERMINAL);

		if (leaves.length > 0) {
			// Terminal view exists, activate it
			leaf = leaves[0];
		} else {
			// Create new terminal view in right sidebar
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_TERMINAL,
					active: true,
				});
			}
		}

		// Reveal and focus the leaf
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	/**
	 * Create new terminal session
	 */
	private createNewTerminal(): void {
		const cwdMode = this.settings.defaultCwdMode;
		this.terminalManager.createSession({ cwdMode });
	}

	/**
	 * Show profile picker and create terminal
	 */
	private showProfilePicker(): void {
		const profiles = this.settings.profiles;

		if (profiles.length === 0) {
			new Notice('No profiles configured. Add profiles in settings.');
			return;
		}

		// Simple profile picker (in production, use a modal with better UX)
		// For now, create with first non-default profile
		const profile = profiles.find((p) => p.id !== 'default') || profiles[0];

		this.terminalManager.createSession({
			profile,
			cwdMode: profile.cwdMode,
		});

		new Notice(`Created terminal with profile: ${profile.name}`);
	}

	/**
	 * Set up auto-cd on file-open
	 */
	private setupAutoCd(): void {
		// Listen for file-open events
		this.registerEvent(
			this.app.workspace.on('file-open', (file: TFile | null) => {
				if (!file) return;
				if (!this.autoCdEnabled) return;
				if (this.settings.defaultCwdMode !== 'active') return;

				// Get file's directory
				const dir = this.pathResolver.getFileDirectory(file);
				if (!dir) return;

				// CD active terminal to this directory
				const activeSession = this.terminalManager.getActiveSession();
				if (activeSession && activeSession.pty.alive()) {
					activeSession.pty.changeDirectory(dir);
				}
			})
		);

		// Enable auto-cd by default if mode is 'active'
		this.autoCdEnabled = this.settings.defaultCwdMode === 'active';
	}

	/**
	 * Set up theme change listener
	 */
	private setupThemeListener(): void {
		// Listen for theme changes
		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				this.updateTerminalThemes();
			})
		);
	}

	/**
	 * Update terminal themes
	 */
	private updateTerminalThemes(): void {
		// Get all terminal views
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL);
		for (const leaf of leaves) {
			const view = leaf.view as TerminalView;
			view.updateTheme();
		}
	}

	/**
	 * Update terminal font size
	 */
	public updateTerminalFontSize(): void {
		// This would need to be implemented in TerminalView
		// For now, just trigger a theme update which could include font size
		this.updateTerminalThemes();
	}

	/**
	 * Update cursor style/blink/color for all terminals
	 */
	public updateTerminalCursorSettings(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TERMINAL);
		for (const leaf of leaves) {
			const view = leaf.view as TerminalView;
			view.updateCursorAppearance();
		}
	}

	/**
	 * Load settings
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Save settings
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
