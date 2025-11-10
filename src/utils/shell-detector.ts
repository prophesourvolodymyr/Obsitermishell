/**
 * Shell Detection Utility
 * Detects the user's default shell on different platforms
 */

import { existsSync } from 'fs';

export class ShellDetector {
	/**
	 * Detect the user's default shell
	 * Returns shell path and arguments for login shell
	 */
	public static detectShell(): { shell: string; args: string[] } {
		const platform = process.platform;

		if (platform === 'win32') {
			return this.detectWindowsShell();
		} else {
			return this.detectPosixShell();
		}
	}

	/**
	 * Detect default shell on POSIX systems (macOS, Linux)
	 */
	private static detectPosixShell(): { shell: string; args: string[] } {
		// Try $SHELL environment variable first
		let shell = process.env.SHELL;

		// Fallback to common shells
		if (!shell || !existsSync(shell)) {
			const commonShells = [
				'/bin/zsh',
				'/bin/bash',
				'/usr/bin/zsh',
				'/usr/bin/bash',
				'/usr/local/bin/zsh',
				'/usr/local/bin/bash',
				'/bin/sh',
			];

			shell = commonShells.find((s) => existsSync(s)) || '/bin/sh';
		}

		// Use -l flag for login shell to load PATH and aliases
		return {
			shell,
			args: ['-l'],
		};
	}

	/**
	 * Detect default shell on Windows
	 */
	private static detectWindowsShell(): { shell: string; args: string[] } {
		// Try PowerShell Core first, then PowerShell, then cmd
		const pwshPath = this.findExecutable('pwsh.exe');
		if (pwshPath) {
			return { shell: pwshPath, args: ['-NoLogo'] };
		}

		const powershellPath = this.findExecutable('powershell.exe');
		if (powershellPath) {
			return { shell: powershellPath, args: ['-NoLogo'] };
		}

		// Fallback to cmd.exe
		const comspec = process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe';
		return { shell: comspec, args: [] };
	}

	/**
	 * Find executable in PATH
	 */
	private static findExecutable(name: string): string | null {
		const pathDirs = (process.env.PATH || '').split(process.platform === 'win32' ? ';' : ':');

		for (const dir of pathDirs) {
			const fullPath = `${dir}${process.platform === 'win32' ? '\\' : '/'}${name}`;
			if (existsSync(fullPath)) {
				return fullPath;
			}
		}

		return null;
	}

	/**
	 * Get shell name from path
	 */
	public static getShellName(shellPath: string): string {
		const parts = shellPath.split(/[/\\]/);
		const filename = parts[parts.length - 1];
		return filename.replace(/\.(exe|com|bat)$/i, '');
	}
}
