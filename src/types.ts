/**
 * Obsitermishell Type Definitions
 */

import type { PTYController } from './PTYController';

/**
 * Auto-CD modes for terminal working directory
 */
export type CwdMode = 'vault' | 'active' | 'sticky';

/**
 * Terminal profile configuration
 */
export interface TerminalProfile {
	id: string;
	name: string;
	init: string; // Commands to run on spawn
	cwdMode: CwdMode;
}

/**
 * Cursor animation styles for the overlay cursor
 */
export type CursorAnimationStyle =
	| 'classic'
	| 'glow'
	| 'pulse'
	| 'comet'
	| 'glitch'
	| 'ripple'
	| 'ember'
	| 'neon'
	| 'glass'
	| 'lightning'
	| 'orbit'
	| 'rainbow'
	| 'wave'
	| 'heartbeat'
	| 'beam'
	| 'vortex';

/**
 * Plugin settings
 */
export interface ObsitermishellSettings {
	shellPath: string; // Path to shell executable
	defaultCwdMode: CwdMode;
	scrollback: number;
	fontSize: number;
	cursorStyle: 'block' | 'underline' | 'bar';
	cursorBlink: boolean;
	cursorAccent: string;
	terminalForeground: string;
	terminalBackground: string;
	cursorAnimation: CursorAnimationStyle;
	activeThemePreset: string; // ID of active theme preset, or 'custom' for manual settings
	donationLink: string;
	workWithMeLink: string;
	repositoryLink: string;
	websiteLink: string;
	profiles: TerminalProfile[];
	restoreSessions: boolean;
	enableSearch: boolean;
	enableWebLinks: boolean;
	showWelcomeBanner: boolean;
	showCoffeeBanner: boolean;
	backgroundImage: string;
	backgroundOpacity: number;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: ObsitermishellSettings = {
	shellPath: '', // Auto-detect
	defaultCwdMode: 'vault',
	scrollback: 10000,
	fontSize: 14,
	cursorStyle: 'block',
	cursorBlink: true,
	cursorAccent: '#7bf7a4',
	terminalForeground: '',
	terminalBackground: '',
	cursorAnimation: 'classic',
	activeThemePreset: 'obsidian', // Default to Obsidian theme
	donationLink: 'https://github.com/sponsors/prophesourvolodymyr',
	workWithMeLink: 'https://github.com/prophesourvolodymyr/Obsitermishell#work-with-me',
	repositoryLink: 'https://github.com/prophesourvolodymyr/Obsitermishell',
	websiteLink: 'https://github.com/prophesourvolodymyr/Obsitermishell#readme',
	profiles: [
		{
			id: 'default',
			name: 'Default',
			init: '',
			cwdMode: 'vault',
		},
	],
	restoreSessions: false,
	enableSearch: true,
	enableWebLinks: true,
	showWelcomeBanner: true,
	showCoffeeBanner: false,
	backgroundImage: '',
	backgroundOpacity: 0.3,
};

/**
 * Terminal session data
 */
export interface TerminalSession {
	id: string;
	name: string;
	pty: PTYController;
	cwd: string;
	profile?: TerminalProfile;
	createdAt: Date;
}

/**
 * Terminal spawn options
 */
export interface TerminalSpawnOptions {
	cwd?: string;
	cwdMode?: CwdMode;
	profile?: TerminalProfile;
	shell?: string;
	env?: NodeJS.ProcessEnv;
}

/**
 * Platform information
 */
export interface PlatformInfo {
	isDesktop: boolean;
	isMobile: boolean;
	platform: NodeJS.Platform;
}

/**
 * Theme configuration for xterm.js
 */
export interface TerminalTheme {
	foreground: string;
	background: string;
	cursor: string;
	cursorAccent: string;
	selectionBackground: string;
	selectionForeground?: string;
	black: string;
	red: string;
	green: string;
	yellow: string;
	blue: string;
	magenta: string;
	cyan: string;
	white: string;
	brightBlack: string;
	brightRed: string;
	brightGreen: string;
	brightYellow: string;
	brightBlue: string;
	brightMagenta: string;
	brightCyan: string;
	brightWhite: string;
}

/**
 * UI color scheme for theming the entire plugin interface
 */
export interface UIColorScheme {
	// Header & Container
	headerBackground: string;
	headerBorder: string;
	containerBackground: string;

	// Tabs
	tabBackground: string;
	tabBackgroundHover: string;
	tabBackgroundActive: string;
	tabText: string;
	tabTextActive: string;
	tabBorder: string;
	tabBorderActive: string;

	// Buttons
	buttonBackground: string;
	buttonBackgroundHover: string;
	buttonText: string;
	buttonBorder: string;

	// Banner
	bannerBackground: string;
	bannerBorder: string;
	bannerText: string;
	bannerTextMuted: string;

	// Banner Links
	linkBackground: string;
	linkBackgroundHover: string;
	linkText: string;
	linkBorder: string;

	// Guide Cards
	guideCardBackground: string;
	guideCardBorder: string;
	guideCardText: string;
	guideCardTextMuted: string;

	// Accent color for highlights
	accentColor: string;
}

/**
 * Theme preset combining cursor animation, terminal colors, and UI colors
 */
export interface ThemePreset {
	id: string;
	name: string;
	description: string;
	cursorAnimation: CursorAnimationStyle;
	cursorAccent: string;
	theme: TerminalTheme;
	uiColors: UIColorScheme;
}
