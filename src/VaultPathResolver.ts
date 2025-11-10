/**
 * Vault Path Resolver
 * Resolves vault root and active note paths for terminal CWD
 */

import { App, FileSystemAdapter, TFile } from 'obsidian';
import { PlatformDetector } from './utils/platform-detector';
import { CwdMode } from './types';
import { dirname, join } from 'path';

export class VaultPathResolver {
	private app: App;
	private vaultRoot: string | null = null;

	constructor(app: App) {
		this.app = app;
		this.detectVaultRoot();
	}

	/**
	 * Detect vault root path using FileSystemAdapter
	 */
	private detectVaultRoot(): void {
		// Only works on desktop
		if (!PlatformDetector.getInstance().isDesktop()) {
			console.warn('VaultPathResolver: Not on desktop, vault root unavailable');
			return;
		}

		const adapter = this.app.vault.adapter;

		// Check if adapter is FileSystemAdapter (desktop only)
		if (adapter instanceof FileSystemAdapter) {
			try {
				this.vaultRoot = adapter.getBasePath();
				console.log('VaultPathResolver: Detected vault root:', this.vaultRoot);
			} catch (error) {
				console.error('VaultPathResolver: Failed to get vault root:', error);
			}
		} else {
			console.warn('VaultPathResolver: Adapter is not FileSystemAdapter');
		}
	}

	/**
	 * Get vault root path
	 */
	public getVaultRoot(): string | null {
		return this.vaultRoot;
	}

	/**
	 * Get active note's parent directory
	 */
	public getActiveNoteDirectory(): string | null {
		if (!this.vaultRoot) {
			return null;
		}

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return null;
		}

		return this.getFileDirectory(activeFile);
	}

	/**
	 * Get directory for a specific file
	 */
	public getFileDirectory(file: TFile): string | null {
		if (!this.vaultRoot) {
			return null;
		}

		// Get file's parent path relative to vault
		const filePath = file.path;
		const fileDir = dirname(filePath);

		// Join with vault root to get absolute path
		// If file is in vault root, dirname will be ".", so use vault root
		if (fileDir === '.' || fileDir === '') {
			return this.vaultRoot;
		}

		return join(this.vaultRoot, fileDir);
	}

	/**
	 * Resolve path based on CWD mode
	 */
	public resolvePath(mode: CwdMode): string | null {
		switch (mode) {
			case 'vault':
				return this.getVaultRoot();

			case 'active':
				return this.getActiveNoteDirectory() || this.getVaultRoot();

			case 'sticky':
				// Sticky mode means don't change CWD, return null
				return null;

			default:
				return this.getVaultRoot();
		}
	}

	/**
	 * Check if vault root is available
	 */
	public isAvailable(): boolean {
		return this.vaultRoot !== null;
	}

	/**
	 * Get fallback directory (user's home)
	 */
	public getFallbackDirectory(): string {
		return process.env.HOME || process.env.USERPROFILE || process.cwd();
	}

	/**
	 * Get initial working directory based on mode
	 */
	public getInitialCwd(mode: CwdMode): string {
		const resolved = this.resolvePath(mode);
		return resolved || this.getFallbackDirectory();
	}
}
