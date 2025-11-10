/**
 * Settings Tab
 * Plugin settings UI for configuring terminal behavior and profiles
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsitermishellPlugin from './main';
import { TerminalProfile } from './types';
import { ShellDetector } from './utils/shell-detector';

export class ObsitermishellSettingTab extends PluginSettingTab {
	plugin: ObsitermishellPlugin;

	constructor(app: App, plugin: ObsitermishellPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'Obsitermishell Settings' });

		// Shell settings
		this.addShellSettings(containerEl);

		// Terminal behavior settings
		this.addBehaviorSettings(containerEl);

		// Appearance settings
		this.addAppearanceSettings(containerEl);

		// Profile settings
		this.addProfileSettings(containerEl);
	}

	/**
	 * Shell settings section
	 */
	private addShellSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Shell' });

		// Shell path
		new Setting(containerEl)
			.setName('Shell path')
			.setDesc('Path to shell executable. Leave empty to auto-detect.')
			.addText((text) =>
				text
					.setPlaceholder('Auto-detect')
					.setValue(this.plugin.settings.shellPath)
					.onChange(async (value) => {
						this.plugin.settings.shellPath = value;
						await this.plugin.saveSettings();
					})
			);

		// Show detected shell
		const detected = ShellDetector.detectShell();
		containerEl.createDiv({
			cls: 'setting-item-description',
			text: `Detected shell: ${detected.shell}`,
		});
	}

	/**
	 * Terminal behavior settings
	 */
	private addBehaviorSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Behavior' });

		// Default CWD mode
		new Setting(containerEl)
			.setName('Default working directory mode')
			.setDesc('How the terminal determines its starting directory.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('vault', 'Vault Root')
					.addOption('active', 'Active Note Folder')
					.addOption('sticky', 'Sticky (Manual)')
					.setValue(this.plugin.settings.defaultCwdMode)
					.onChange(async (value) => {
						this.plugin.settings.defaultCwdMode = value as 'vault' | 'active' | 'sticky';
						await this.plugin.saveSettings();
					})
			);

		// Scrollback
		new Setting(containerEl)
			.setName('Scrollback buffer')
			.setDesc('Number of lines to keep in terminal history.')
			.addText((text) =>
				text
					.setPlaceholder('10000')
					.setValue(String(this.plugin.settings.scrollback))
					.onChange(async (value) => {
						const num = parseInt(value, 10);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.scrollback = num;
							await this.plugin.saveSettings();
						}
					})
			);

		// Restore sessions
		new Setting(containerEl)
			.setName('Restore sessions on startup')
			.setDesc('Restore terminal sessions when Obsidian reopens.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.restoreSessions).onChange(async (value) => {
					this.plugin.settings.restoreSessions = value;
					await this.plugin.saveSettings();
				})
			);

		// Enable search
		new Setting(containerEl)
			.setName('Enable search')
			.setDesc('Enable search addon for finding text in terminal.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableSearch).onChange(async (value) => {
					this.plugin.settings.enableSearch = value;
					await this.plugin.saveSettings();
				})
			);

		// Enable web links
		new Setting(containerEl)
			.setName('Enable web links')
			.setDesc('Make URLs in terminal clickable.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableWebLinks).onChange(async (value) => {
					this.plugin.settings.enableWebLinks = value;
					await this.plugin.saveSettings();
				})
			);
	}

	/**
	 * Appearance settings
	 */
	private addAppearanceSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Appearance' });

		// Font size
		new Setting(containerEl)
			.setName('Font size')
			.setDesc('Terminal font size in pixels.')
			.addSlider((slider) =>
				slider
					.setLimits(10, 24, 1)
					.setValue(this.plugin.settings.fontSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.fontSize = value;
						await this.plugin.saveSettings();
						// Update all terminal views
						this.plugin.updateTerminalFontSize();
					})
			);
	}

	/**
	 * Profile settings
	 */
	private addProfileSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Profiles' });

		containerEl.createDiv({
			cls: 'setting-item-description',
			text: 'Profiles let you create terminals with predefined commands and settings.',
		});

		// Render existing profiles
		for (let i = 0; i < this.plugin.settings.profiles.length; i++) {
			this.renderProfile(containerEl, i);
		}

		// Add profile button
		new Setting(containerEl).addButton((button) =>
			button
				.setButtonText('Add Profile')
				.setCta()
				.onClick(() => {
					this.addNewProfile();
				})
		);
	}

	/**
	 * Render a profile
	 */
	private renderProfile(containerEl: HTMLElement, index: number): void {
		const profile = this.plugin.settings.profiles[index];

		const profileDiv = containerEl.createDiv({ cls: 'obsitermishell-settings-profile' });

		// Profile header
		const headerDiv = profileDiv.createDiv({ cls: 'obsitermishell-settings-profile-header' });
		headerDiv.createSpan({ cls: 'obsitermishell-settings-profile-name', text: profile.name });

		const actionsDiv = headerDiv.createDiv({ cls: 'obsitermishell-settings-profile-actions' });

		// Delete button (can't delete default profile)
		if (profile.id !== 'default') {
			actionsDiv.createEl('button', { text: 'Delete' }).addEventListener('click', () => {
				this.deleteProfile(index);
			});
		}

		// Profile name
		new Setting(profileDiv)
			.setName('Name')
			.addText((text) =>
				text.setValue(profile.name).onChange(async (value) => {
					profile.name = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh
				})
			);

		// Init commands
		new Setting(profileDiv)
			.setName('Init commands')
			.setDesc('Commands to run when terminal starts.')
			.addTextArea((text) =>
				text
					.setValue(profile.init)
					.setPlaceholder('e.g., claude code')
					.onChange(async (value) => {
						profile.init = value;
						await this.plugin.saveSettings();
					})
			);

		// CWD mode
		new Setting(profileDiv)
			.setName('Working directory')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('vault', 'Vault Root')
					.addOption('active', 'Active Note Folder')
					.addOption('sticky', 'Sticky (Manual)')
					.setValue(profile.cwdMode)
					.onChange(async (value) => {
						profile.cwdMode = value as 'vault' | 'active' | 'sticky';
						await this.plugin.saveSettings();
					})
			);
	}

	/**
	 * Add new profile
	 */
	private addNewProfile(): void {
		const newProfile: TerminalProfile = {
			id: `profile-${Date.now()}`,
			name: 'New Profile',
			init: '',
			cwdMode: 'vault',
		};

		this.plugin.settings.profiles.push(newProfile);
		this.plugin.saveSettings();
		this.display(); // Refresh
	}

	/**
	 * Delete profile
	 */
	private deleteProfile(index: number): void {
		this.plugin.settings.profiles.splice(index, 1);
		this.plugin.saveSettings();
		this.display(); // Refresh
	}
}
