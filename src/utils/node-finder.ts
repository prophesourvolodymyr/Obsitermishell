import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { platform } from 'os';

/**
 * Find the Node.js executable path
 * Electron has a limited PATH, so we need to search common locations
 */
export class NodeFinder {
	private static cachedPath: string | null = null;

	/**
	 * Get the path to node executable
	 */
	public static findNodePath(): string {
		if (this.cachedPath) {
			return this.cachedPath;
		}

		// Try common paths first (fast)
		const commonPaths = this.getCommonNodePaths();
		for (const path of commonPaths) {
			if (existsSync(path)) {
				console.log(`[NodeFinder] Found node at: ${path}`);
				this.cachedPath = path;
				return path;
			}
		}

		// Try using 'which' or 'where' command
		try {
			const command = platform() === 'win32' ? 'where node' : 'which node';
			const result = execSync(command, {
				encoding: 'utf8',
				timeout: 5000,
				// Use user's shell environment
				env: this.getUserEnvironment()
			}).trim();

			if (result) {
				// 'where' on Windows may return multiple lines, take the first
				const nodePath = result.split('\n')[0].trim();
				if (existsSync(nodePath)) {
					console.log(`[NodeFinder] Found node via ${command}: ${nodePath}`);
					this.cachedPath = nodePath;
					return nodePath;
				}
			}
		} catch (err) {
			console.warn('[NodeFinder] Could not find node using which/where:', err);
		}

		// Last resort: hope 'node' is in PATH
		console.warn('[NodeFinder] Using fallback "node" - may not work in Electron');
		return 'node';
	}

	/**
	 * Get common node installation paths by platform
	 */
	private static getCommonNodePaths(): string[] {
		const os = platform();
		const homeDir = process.env.HOME || process.env.USERPROFILE || '';

		if (os === 'darwin') {
			// macOS
			return [
				'/usr/local/bin/node',           // Homebrew Intel
				'/opt/homebrew/bin/node',        // Homebrew Apple Silicon
				`${homeDir}/.nvm/versions/node/v20.0.0/bin/node`,  // nvm (common version)
				`${homeDir}/.nvm/versions/node/v18.0.0/bin/node`,
				`${homeDir}/.nvm/versions/node/v16.0.0/bin/node`,
				'/usr/bin/node',                 // System
			];
		} else if (os === 'win32') {
			// Windows
			return [
				'C:\\Program Files\\nodejs\\node.exe',
				'C:\\Program Files (x86)\\nodejs\\node.exe',
				`${process.env.APPDATA}\\nvm\\node.exe`,
				`${process.env.ProgramFiles}\\nodejs\\node.exe`,
			];
		} else {
			// Linux
			return [
				'/usr/bin/node',
				'/usr/local/bin/node',
				`${homeDir}/.nvm/versions/node/v20.0.0/bin/node`,
				`${homeDir}/.nvm/versions/node/v18.0.0/bin/node`,
				`${homeDir}/.nvm/versions/node/v16.0.0/bin/node`,
			];
		}
	}

	/**
	 * Get user's full environment by reading shell
	 */
	private static getUserEnvironment(): NodeJS.ProcessEnv {
		const os = platform();

		try {
			if (os === 'win32') {
				// Windows: get PATH from registry or current env
				return process.env;
			} else {
				// macOS/Linux: source shell profile and get env
				const shell = process.env.SHELL || '/bin/bash';
				const initFile = this.getShellInitFile(shell);

				// Execute shell with init file to get environment
				const envOutput = execSync(
					`${shell} -l -c 'env'`,
					{
						encoding: 'utf8',
						timeout: 5000,
						stdio: ['ignore', 'pipe', 'ignore']
					}
				);

				// Parse env output into object
				const env: NodeJS.ProcessEnv = { ...process.env };
				for (const line of envOutput.split('\n')) {
					const match = line.match(/^([^=]+)=(.*)$/);
					if (match) {
						env[match[1]] = match[2];
					}
				}

				return env;
			}
		} catch (err) {
			console.warn('[NodeFinder] Could not get user environment:', err);
			return process.env;
		}
	}

	/**
	 * Get shell init file based on shell type
	 */
	private static getShellInitFile(shell: string): string {
		if (shell.includes('zsh')) {
			return '~/.zprofile';
		} else if (shell.includes('bash')) {
			return '~/.bash_profile';
		} else if (shell.includes('fish')) {
			return '~/.config/fish/config.fish';
		}
		return '~/.profile';
	}

	/**
	 * Verify node is working at given path
	 */
	public static verifyNode(nodePath: string): boolean {
		try {
			const version = execSync(`"${nodePath}" --version`, {
				encoding: 'utf8',
				timeout: 3000
			}).trim();
			console.log(`[NodeFinder] Node version at ${nodePath}: ${version}`);
			return version.startsWith('v');
		} catch (err) {
			return false;
		}
	}
}
