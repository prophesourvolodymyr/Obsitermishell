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
	cursorAnimation: CursorAnimationStyle;
	donationLink: string;
	workWithMeLink: string;
	repositoryLink: string;
	websiteLink: string;
	profiles: TerminalProfile[];
	restoreSessions: boolean;
	enableSearch: boolean;
	enableWebLinks: boolean;
	showWelcomeBanner: boolean;
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
	cursorAnimation: 'classic',
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
