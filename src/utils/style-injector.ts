/**
 * Injects the xterm.js stylesheet into the document once.
 */
import xtermCss from '@xterm/xterm/css/xterm.css';

let hasInjected = false;
const STYLE_ID = 'obsitermishell-xterm-styles';

export function ensureXtermStylesInjected(): void {
	if (hasInjected) {
		return;
	}

	if (typeof document === 'undefined') {
		return;
	}

	if (document.getElementById(STYLE_ID)) {
		hasInjected = true;
		return;
	}

	const styleEl = document.createElement('style');
	styleEl.id = STYLE_ID;
	styleEl.textContent = xtermCss;
	document.head.appendChild(styleEl);
	hasInjected = true;
}
