/**
 * Platform Detection Utility
 * Detects whether running on desktop or mobile
 */

import { Platform } from 'obsidian';
import { PlatformInfo } from '../types';

export class PlatformDetector {
	private static instance: PlatformDetector;
	private platformInfo: PlatformInfo;

	private constructor() {
		// Obsidian provides Platform.isMobile and Platform.isDesktop
		this.platformInfo = {
			isDesktop: !Platform.isMobile,
			isMobile: Platform.isMobile,
			platform: process.platform,
		};
	}

	public static getInstance(): PlatformDetector {
		if (!PlatformDetector.instance) {
			PlatformDetector.instance = new PlatformDetector();
		}
		return PlatformDetector.instance;
	}

	public getPlatformInfo(): PlatformInfo {
		return this.platformInfo;
	}

	public isDesktop(): boolean {
		return this.platformInfo.isDesktop;
	}

	public isMobile(): boolean {
		return this.platformInfo.isMobile;
	}

	public getPlatform(): NodeJS.Platform {
		return this.platformInfo.platform;
	}

	public isWindows(): boolean {
		return this.platformInfo.platform === 'win32';
	}

	public isMacOS(): boolean {
		return this.platformInfo.platform === 'darwin';
	}

	public isLinux(): boolean {
		return this.platformInfo.platform === 'linux';
	}
}
