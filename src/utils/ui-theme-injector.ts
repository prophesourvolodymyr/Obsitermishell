/**
 * UI Theme Injector
 * Dynamically injects CSS variables for theme colors
 */

import { UIColorScheme } from '../types';

const THEME_STYLE_ID = 'obsitermishell-theme-style';

/**
 * Apply UI theme colors by injecting CSS variables
 */
export function applyUITheme(uiColors: UIColorScheme, containerId?: string): void {
	// Remove existing theme style
	const existing = document.getElementById(THEME_STYLE_ID);
	if (existing) {
		existing.remove();
	}

	// Create CSS with variables
	const selector = containerId ? `#${containerId}` : '.obsitermishell-view';
	const css = `
${selector} {
	/* Header & Container */
	--obs-header-bg: ${uiColors.headerBackground};
	--obs-header-border: ${uiColors.headerBorder};
	--obs-container-bg: ${uiColors.containerBackground};

	/* Tabs */
	--obs-tab-bg: ${uiColors.tabBackground};
	--obs-tab-bg-hover: ${uiColors.tabBackgroundHover};
	--obs-tab-bg-active: ${uiColors.tabBackgroundActive};
	--obs-tab-text: ${uiColors.tabText};
	--obs-tab-text-active: ${uiColors.tabTextActive};
	--obs-tab-border: ${uiColors.tabBorder};
	--obs-tab-border-active: ${uiColors.tabBorderActive};

	/* Buttons */
	--obs-button-bg: ${uiColors.buttonBackground};
	--obs-button-bg-hover: ${uiColors.buttonBackgroundHover};
	--obs-button-text: ${uiColors.buttonText};
	--obs-button-border: ${uiColors.buttonBorder};

	/* Banner */
	--obs-banner-bg: ${uiColors.bannerBackground};
	--obs-banner-border: ${uiColors.bannerBorder};
	--obs-banner-text: ${uiColors.bannerText};
	--obs-banner-text-muted: ${uiColors.bannerTextMuted};

	/* Banner Links */
	--obs-link-bg: ${uiColors.linkBackground};
	--obs-link-bg-hover: ${uiColors.linkBackgroundHover};
	--obs-link-text: ${uiColors.linkText};
	--obs-link-border: ${uiColors.linkBorder};

	/* Guide Cards */
	--obs-guide-card-bg: ${uiColors.guideCardBackground};
	--obs-guide-card-border: ${uiColors.guideCardBorder};
	--obs-guide-card-text: ${uiColors.guideCardText};
	--obs-guide-card-text-muted: ${uiColors.guideCardTextMuted};

	/* Accent */
	--obs-accent: ${uiColors.accentColor};
}
	`;

	// Inject style
	const style = document.createElement('style');
	style.id = THEME_STYLE_ID;
	style.textContent = css;
	document.head.appendChild(style);
}

/**
 * Remove theme styling
 */
export function removeUITheme(): void {
	const existing = document.getElementById(THEME_STYLE_ID);
	if (existing) {
		existing.remove();
	}
}
