/**
 * Theme Manager
 * Syncs xterm.js themes with Obsidian's light/dark mode
 */

import { TerminalTheme } from '../types';

export class ThemeManager {
	/**
	 * Get xterm.js theme based on Obsidian's current theme
	 */
	public static getTheme(isDarkMode: boolean): TerminalTheme {
		if (isDarkMode) {
			return this.getDarkTheme();
		} else {
			return this.getLightTheme();
		}
	}

	/**
	 * Dark theme (based on popular terminal themes)
	 */
	private static getDarkTheme(): TerminalTheme {
		return {
			foreground: '#d4d4d4',
			background: '#1e1e1e',
			cursor: '#d4d4d4',
			cursorAccent: '#1e1e1e',
			selectionBackground: 'rgba(255, 255, 255, 0.3)',
			black: '#000000',
			red: '#cd3131',
			green: '#0dbc79',
			yellow: '#e5e510',
			blue: '#2472c8',
			magenta: '#bc3fbc',
			cyan: '#11a8cd',
			white: '#e5e5e5',
			brightBlack: '#666666',
			brightRed: '#f14c4c',
			brightGreen: '#23d18b',
			brightYellow: '#f5f543',
			brightBlue: '#3b8eea',
			brightMagenta: '#d670d6',
			brightCyan: '#29b8db',
			brightWhite: '#e5e5e5',
		};
	}

	/**
	 * Light theme
	 */
	private static getLightTheme(): TerminalTheme {
		return {
			foreground: '#383a42',
			background: '#fafafa',
			cursor: '#383a42',
			cursorAccent: '#fafafa',
			selectionBackground: 'rgba(0, 0, 0, 0.2)',
			black: '#000000',
			red: '#e45649',
			green: '#50a14f',
			yellow: '#c18401',
			blue: '#0184bc',
			magenta: '#a626a4',
			cyan: '#0997b3',
			white: '#fafafa',
			brightBlack: '#696c77',
			brightRed: '#e45649',
			brightGreen: '#50a14f',
			brightYellow: '#c18401',
			brightBlue: '#0184bc',
			brightMagenta: '#a626a4',
			brightCyan: '#0997b3',
			brightWhite: '#fafafa',
		};
	}

	/**
	 * Get CSS variable value from Obsidian
	 */
	public static getCssVariable(name: string): string {
		return getComputedStyle(document.body).getPropertyValue(name).trim();
	}

	/**
	 * Check if Obsidian is in dark mode
	 */
	public static isDarkMode(): boolean {
		return document.body.classList.contains('theme-dark');
	}

	/**
	 * Create a custom theme based on Obsidian CSS variables
	 */
	public static getObsidianTheme(): TerminalTheme {
		const isDark = this.isDarkMode();
		const baseTheme = this.getTheme(isDark);

		// Try to extract colors from Obsidian CSS variables
		const background = this.getCssVariable('--background-primary') || baseTheme.background;
		const foreground = this.getCssVariable('--text-normal') || baseTheme.foreground;

		return {
			...baseTheme,
			background,
			foreground,
		};
	}
}
