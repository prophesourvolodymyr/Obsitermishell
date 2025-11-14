/**
 * Settings Tab
 * Plugin settings UI for configuring terminal behavior and profiles
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsitermishellPlugin from './main';
import { TerminalProfile, CursorAnimationStyle } from './types';
import { ShellDetector } from './utils/shell-detector';
import { getAllThemePresets, getThemePreset } from './utils/theme-presets';

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

		// Profile settings
		this.addProfileSettings(containerEl);

		// Shell settings
		this.addShellSettings(containerEl);

		// Terminal behavior settings
		this.addBehaviorSettings(containerEl);

		// Appearance settings
		this.addAppearanceSettings(containerEl);
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

		// Theme preset selector
		const presets = getAllThemePresets();
		const presetOptions: Record<string, string> = {
			'obsidian': '🪨 Obsidian Adaptive',
			'custom': '⚙️ Custom Settings',
		};

		// Add all theme presets to options
		for (const preset of presets) {
			if (preset.id !== 'obsidian') {
				presetOptions[preset.id] = preset.name;
			}
		}

		new Setting(containerEl)
			.setName('Theme preset')
			.setDesc('Choose a complete theme with cursor animation and colors')
			.addDropdown((dropdown) => {
				for (const [value, label] of Object.entries(presetOptions)) {
					dropdown.addOption(value, label);
				}
				dropdown
					.setValue(this.plugin.settings.activeThemePreset || 'obsidian')
					.onChange(async (value) => {
						this.plugin.settings.activeThemePreset = value;

						// If a preset is selected, apply its settings
						if (value !== 'custom' && value !== 'obsidian') {
							const preset = getThemePreset(value);
							if (preset) {
								this.plugin.settings.cursorAnimation = preset.cursorAnimation;
								this.plugin.settings.cursorAccent = preset.cursorAccent;
							}
						}

						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();

						// Refresh settings display to show new values
						this.display();
					});
			})
			.addExtraButton((button) => {
				button
					.setIcon('info')
					.setTooltip('View theme details')
					.onClick(() => {
						const preset = getThemePreset(this.plugin.settings.activeThemePreset);
						if (preset) {
							alert(`${preset.name}\n\n${preset.description}\n\nCursor: ${preset.cursorAnimation}`);
						}
					});
			});

		// Show theme description
		const activePreset = getThemePreset(this.plugin.settings.activeThemePreset);
		if (activePreset) {
			containerEl.createDiv({
				cls: 'setting-item-description',
				text: `${activePreset.description}`,
			});
		}

		containerEl.createEl('br');

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

		// Cursor style
		new Setting(containerEl)
			.setName('Cursor style')
			.setDesc('Choose the terminal cursor shape.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('block', 'Block')
					.addOption('underline', 'Underline')
					.addOption('bar', 'Bar')
					.setValue(this.plugin.settings.cursorStyle)
					.onChange(async (value) => {
						this.plugin.settings.cursorStyle = value as 'block' | 'underline' | 'bar';
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
					})
			);

		// Cursor blink
		new Setting(containerEl)
			.setName('Cursor blink')
			.setDesc('Toggle blinking animation for the cursor.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.cursorBlink).onChange(async (value) => {
					this.plugin.settings.cursorBlink = value;
					await this.plugin.saveSettings();
					this.plugin.updateTerminalCursorSettings();
				})
			);

		// Cursor accent color
		new Setting(containerEl)
			.setName('Cursor accent color')
			.setDesc('Leave empty to use theme default.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.cursorAccent || '#7bf7a4')
					.onChange(async (value) => {
						this.plugin.settings.cursorAccent = value;
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
					})
			);

		// Terminal foreground color
		const textColorSetting = new Setting(containerEl)
			.setName('Terminal text color')
			.setDesc('Customize the foreground color. Leave blank to follow the current theme.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.terminalForeground || '#ffffff')
					.onChange(async (value) => {
						this.plugin.settings.terminalForeground = value;
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
					})
			);

		textColorSetting.addExtraButton((button) =>
			button
				.setIcon('undo')
				.setTooltip('Use theme color')
				.onClick(async () => {
					this.plugin.settings.terminalForeground = '';
					await this.plugin.saveSettings();
					this.plugin.updateTerminalCursorSettings();
				})
		);

		// Cursor animation style
		const animationOptions: { value: string; label: string }[] = [
			{ value: 'classic', label: 'Classic (system cursor)' },
			{ value: 'glow', label: 'Glow' },
			{ value: 'pulse', label: 'Pulse' },
			{ value: 'comet', label: 'Comet' },
			{ value: 'glitch', label: 'Glitch' },
			{ value: 'ripple', label: 'Ripple' },
			{ value: 'ember', label: 'Ember' },
			{ value: 'neon', label: 'Neon' },
			{ value: 'glass', label: 'Glass' },
			{ value: 'lightning', label: 'Lightning' },
			{ value: 'orbit', label: 'Orbit' },
			{ value: 'rainbow', label: 'Rainbow' },
			{ value: 'wave', label: 'Wave' },
			{ value: 'heartbeat', label: 'Heartbeat' },
			{ value: 'beam', label: 'Beam' },
			{ value: 'vortex', label: 'Vortex' },
		];

		new Setting(containerEl)
			.setName('Cursor animation')
			.setDesc('Choose from premium cursor animations inspired by Ghostty styles.')
			.addDropdown((dropdown) => {
				for (const option of animationOptions) {
					dropdown.addOption(option.value, option.label);
				}
				dropdown
				.setValue(this.plugin.settings.cursorAnimation || 'classic')
				.onChange(async (value) => {
					this.plugin.settings.cursorAnimation = value as CursorAnimationStyle;
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
					});
			});

		// Welcome banner
		new Setting(containerEl)
			.setName('Show welcome banner')
			.setDesc('Display ASCII art banner when opening a new terminal.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showWelcomeBanner).onChange(async (value) => {
					this.plugin.settings.showWelcomeBanner = value;
					await this.plugin.saveSettings();
				})
			);

		// Coffee button
		new Setting(containerEl)
			.setName('Show "Buy me a coffee" button')
			.setDesc('Display the "Buy me a coffee" button in the terminal banner.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showCoffeeBanner).onChange(async (value) => {
					this.plugin.settings.showCoffeeBanner = value;
					await this.plugin.saveSettings();
					this.plugin.updateTerminalCursorSettings();
				})
			);

		// Background image section header
		containerEl.createEl('h4', { text: 'Terminal Background', cls: 'setting-item-heading' });

		// Background image upload
		new Setting(containerEl)
			.setName('Background image')
			.setDesc('Upload a custom background image for the terminal. Leave empty for no background.')
			.addButton((button) =>
				button
					.setButtonText('Upload Image')
					.setCta()
					.onClick(async () => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = 'image/*';
						input.onchange = async (e: Event) => {
							const file = (e.target as HTMLInputElement).files?.[0];
							if (file) {
								const reader = new FileReader();
								reader.onload = async (event) => {
									const dataUrl = event.target?.result as string;
									this.plugin.settings.backgroundImage = dataUrl;
									await this.plugin.saveSettings();
									this.plugin.updateTerminalCursorSettings();
									this.display(); // Refresh settings to show current image
								};
								reader.readAsDataURL(file);
							}
						};
						input.click();
					})
			)
			.addButton((button) =>
				button
					.setButtonText('Clear')
					.onClick(async () => {
						this.plugin.settings.backgroundImage = '';
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
						this.display();
					})
			);

		// Show current background preview if exists
		if (this.plugin.settings.backgroundImage) {
			const previewContainer = containerEl.createDiv({ cls: 'obsitermishell-bg-preview' });
			const previewImg = previewContainer.createEl('img', {
				attr: { src: this.plugin.settings.backgroundImage },
			});
			previewImg.style.maxWidth = '200px';
			previewImg.style.maxHeight = '150px';
			previewImg.style.borderRadius = '4px';
			previewImg.style.marginTop = '8px';
		}

		// Background opacity
		new Setting(containerEl)
			.setName('Background opacity')
			.setDesc('Adjust the opacity of the background image (0 = transparent, 1 = opaque).')
			.addSlider((slider) =>
				slider
					.setLimits(0, 1, 0.05)
					.setValue(this.plugin.settings.backgroundOpacity)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.backgroundOpacity = value;
						await this.plugin.saveSettings();
						this.plugin.updateTerminalCursorSettings();
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
