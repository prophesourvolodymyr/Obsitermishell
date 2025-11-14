/**
 * UI Theme Generator
 * Creates UI color schemes from terminal theme colors
 */

import { UIColorScheme } from '../types';

/**
 * Generate UI color scheme from base colors
 */
export function generateUIColors(
	primary: string,
	background: string,
	accent: string,
	options: {
		dim?: number;
		bright?: number;
	} = {}
): UIColorScheme {
	const { dim = 0.7, bright = 1.2 } = options;

	return {
		// Header & Container
		headerBackground: adjustBrightness(background, 1.1),
		headerBorder: adjustBrightness(primary, 0.3),
		containerBackground: background,

		// Tabs
		tabBackground: adjustBrightness(background, 1.15),
		tabBackgroundHover: adjustBrightness(background, 1.25),
		tabBackgroundActive: accent,
		tabText: adjustBrightness(primary, dim),
		tabTextActive: background,
		tabBorder: adjustBrightness(primary, 0.3),
		tabBorderActive: accent,

		// Buttons
		buttonBackground: adjustBrightness(background, 1.15),
		buttonBackgroundHover: adjustBrightness(background, 1.3),
		buttonText: adjustBrightness(primary, 0.9),
		buttonBorder: adjustBrightness(primary, 0.3),

		// Banner
		bannerBackground: adjustBrightness(background, 1.08),
		bannerBorder: adjustBrightness(primary, 0.25),
		bannerText: primary,
		bannerTextMuted: adjustBrightness(primary, dim),

		// Banner Links
		linkBackground: addAlpha(accent, 0.15),
		linkBackgroundHover: addAlpha(accent, 0.25),
		linkText: accent,
		linkBorder: addAlpha(accent, 0.45),

		// Guide Cards
		guideCardBackground: addAlpha(accent, 0.08),
		guideCardBorder: addAlpha(accent, 0.35),
		guideCardText: adjustBrightness(primary, dim),
		guideCardTextMuted: adjustBrightness(primary, dim * 0.8),

		// Accent
		accentColor: accent,
	};
}

/**
 * Adjust brightness of a hex color
 */
function adjustBrightness(hex: string, factor: number): string {
	// Handle rgba colors
	if (hex.startsWith('rgba')) {
		return hex;
	}

	// Parse hex
	const cleaned = hex.replace('#', '');
	let r = parseInt(cleaned.substring(0, 2), 16);
	let g = parseInt(cleaned.substring(2, 4), 16);
	let b = parseInt(cleaned.substring(4, 6), 16);

	// Adjust
	r = Math.min(255, Math.max(0, Math.round(r * factor)));
	g = Math.min(255, Math.max(0, Math.round(g * factor)));
	b = Math.min(255, Math.max(0, Math.round(b * factor)));

	// Convert back
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Add alpha channel to hex color
 */
function addAlpha(hex: string, alpha: number): string {
	const cleaned = hex.replace('#', '');
	const r = parseInt(cleaned.substring(0, 2), 16);
	const g = parseInt(cleaned.substring(2, 4), 16);
	const b = parseInt(cleaned.substring(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
